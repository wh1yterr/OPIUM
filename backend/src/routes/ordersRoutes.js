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
      const { items, address } = req.body;

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
        } else {
          // Проверка общего остатка по продукту
          const prodResult = await pool.query(
            'SELECT quantity FROM products WHERE id = $1',
            [item.product_id]
          );
          const available = prodResult.rows[0]?.quantity || 0;
          if (available < item.quantity) {
            return res.status(400).json({
              message: `Недостаточно товара "${item.name || 'неизвестный товар'}" в наличии. Остаток: ${available}`
            });
          }
        }
      }

      const totalPrice = items.reduce((total, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
        return total + price * item.quantity;
      }, 0);

      // Begin transaction to ensure atomicity
      await pool.query('BEGIN');
      try {
        // Insert order including delivery address
        const orderResult = await pool.query(
          'INSERT INTO orders (user_id, total_price, status, delivery_address) VALUES ($1, $2, $3, $4) RETURNING *',
          [token.id, totalPrice, 'pending', address || null]
        );
        const orderId = orderResult.rows[0].id;

        // Add order items and decrement stocks
        for (const item of items) {
          const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
          await pool.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price_at_order, size_name, size_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [orderId, item.product_id, item.quantity, price, item.size_name || null, item.size_id || null]
          );

          // Decrement stock by size if provided, otherwise by product
          if (item.size_id) {
            await pool.query(
              'UPDATE sizes SET quantity = quantity - $1 WHERE id = $2',
              [item.quantity, item.size_id]
            );
          } else {
            await pool.query(
              'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
              [item.quantity, item.product_id]
            );
          }
        }

        // Clear cart
        await pool.query('DELETE FROM cart WHERE user_id = $1', [token.id]);

        await pool.query('COMMIT');
        console.log('Заказ оформлен:', orderResult.rows[0]);
        res.status(201).json({ 
          message: 'Заказ успешно оформлен', 
          order: orderResult.rows[0]
        });
      } catch (txErr) {
        await pool.query('ROLLBACK');
        console.error('Ошибка в транзакции оформления заказа:', txErr);
        return res.status(500).json({ message: 'Ошибка оформления заказа', error: txErr.message });
      }
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // NOTE: orders no longer include tracking codes on creation

  // Получение заказов пользователя
  router.get('/', authenticateToken, async (req, res) => {
    try {
      console.log('Запрос заказов для user_id:', req.user.id);
      const token = req.user;
      const result = await pool.query(
        `SELECT o.id, o.total_price, o.created_at, o.status,
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
         GROUP BY o.id, o.total_price, o.created_at, o.status
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
        `SELECT o.id, o.user_id, o.total_price, o.created_at, o.status,
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
        GROUP BY o.id, o.user_id, o.total_price, o.created_at, o.status, u.email
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

      // Notifications via tracked orders removed

      console.log('Статус обновлён:', result.rows[0]);
      res.json({ message: 'Статус заказа обновлён', order: result.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Tracking endpoints removed — issuance of tracking codes disabled

  return router;
};