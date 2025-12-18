const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();


  // Middleware для проверки токена
  const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Доступ запрещён' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Недействительный токен' });
      req.user = user;
      next();
    });
  };

  // Middleware для проверки роли админа
  const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ только для администраторов' });
    }
    next();
  };

  // Оформление заказа
  router.post('/', authenticateToken, async (req, res) => {
    try {
      console.log('Запрос на оформление заказа:', req.body);
      const token = req.user;
      const { items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Корзина пуста' });
      }

      // Проверка остатков перед оформлением
      for (const item of items) {
        if (item.size_id) {
          // Проверка остатка для конкретного размера
          const sizeResult = await pool.query(
            'SELECT quantity FROM sizes WHERE id = $1',
            [item.size_id]
          );
          const availableQuantity = sizeResult.rows[0]?.quantity || 0;
          if (availableQuantity < item.quantity) {
            return res.status(400).json({ 
              message: `Недостаточно товара "${item.name || 'неизвестный товар'}" размера ${item.size_name || ''} в наличии. Остаток: ${availableQuantity}` 
            });
          }
        }
      }

      const totalPrice = items.reduce((total, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
        return total + price * item.quantity;
      }, 0);

      // Создание заказа (без генерации order_code)
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING *',
        [token.id, totalPrice, 'pending']
      );
      const orderId = orderResult.rows[0].id;

      // Добавление элементов заказа и вычитание остатков
      for (const item of items) {
        const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_order, size_name) VALUES ($1, $2, $3, $4, $5)',
          [orderId, item.product_id, item.quantity, price, item.size_name || null]
        );
        // Вычитание остатка из таблицы размеров
        if (item.size_id) {
          await pool.query(
            'UPDATE sizes SET quantity = quantity - $1 WHERE id = $2',
            [item.quantity, item.size_id]
          );
        }
      }

      // Очистка корзины
      await pool.query('DELETE FROM cart WHERE user_id = $1', [token.id]);

      console.log('Заказ оформлен:', orderResult.rows[0]);
      res.status(201).json({ 
        message: 'Заказ успешно оформлен', 
        order: orderResult.rows[0], 
        order_code: orderCode 
      });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // NOTE: order_code lookup removed — orders no longer issue codes on creation

  // Получение заказов пользователя
  router.get('/', authenticateToken, async (req, res) => {
    try {
      console.log('Запрос заказов для user_id:', req.user.id);
      const token = req.user;
      const result = await pool.query(
        `SELECT o.id, o.total_price, o.created_at, o.status, o.order_code,
                json_agg(
                  json_build_object(
                    'product_id', oi.product_id,
                    'name', p.name,
                    'quantity', oi.quantity,
                    'price_at_order', oi.price_at_order,
                    'size_name', oi.size_name
                  )
                ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.user_id = $1
         GROUP BY o.id, o.total_price, o.created_at, o.status, o.order_code
         ORDER BY o.created_at DESC`,
        [token.id]
      );
      console.log('Результат заказов:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Получение всех заказов (только для админа)
  router.get('/all', authenticateToken, checkAdmin, async (req, res) => {
    try {
      console.log('Запрос всех заказов для админа:', req.user.id);
      const result = await pool.query(
        `SELECT o.id, o.user_id, o.total_price, o.created_at, o.status, o.order_code,
                u.email as user_email,
                json_agg(
                  json_build_object(
                    'product_id', oi.product_id,
                    'name', p.name,
                    'quantity', oi.quantity,
                    'price_at_order', oi.price_at_order,
                    'size_name', oi.size_name
                  )
                ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN users u ON o.user_id = u.id
         GROUP BY o.id, o.user_id, o.total_price, o.created_at, o.status, o.order_code, u.email
         ORDER BY o.created_at DESC`
      );
      console.log('Результат всех заказов:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: 'Ошибка загрузки заказов', error: err.message });
    }
  });

  // Обновление статуса заказа (только для админа)
  router.put('/:orderId/status', authenticateToken, checkAdmin, async (req, res) => {
    try {
      console.log('Обновление статуса заказа:', req.params.orderId, req.body);
      const { orderId } = req.params;
      const { status } = req.body;

      if (!['pending', 'shipped', 'delivered', 'canceled'].includes(status)) {
        return res.status(400).json({ message: 'Недопустимый статус' });
      }

      const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, orderId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }

      // Notifications via tracked orders removed (order_code tracking disabled)

      console.log('Статус обновлён:', result.rows[0]);
      res.json({ message: 'Статус заказа обновлён', order: result.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Tracking endpoints removed — order_code issuance disabled

  return router;
};