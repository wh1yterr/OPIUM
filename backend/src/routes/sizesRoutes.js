const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();

  // Middleware для проверки токена
  router.use((req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Доступ запрещён' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Недействительный токен' });
      req.user = user;
      next();
    });
  });

  // Middleware для проверки роли админа
  const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ только для администраторов' });
    }
    next();
  };

  // Получить все размеры для продукта
  router.get('/product/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const result = await pool.query(
        'SELECT * FROM sizes WHERE product_id = $1 ORDER BY CASE size_name WHEN \'XS\' THEN 1 WHEN \'S\' THEN 2 WHEN \'M\' THEN 3 WHEN \'L\' THEN 4 WHEN \'XL\' THEN 5 WHEN \'XXL\' THEN 6 END',
        [productId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching sizes:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Добавить размер к продукту (только админ)
  router.post('/', checkAdmin, async (req, res) => {
    try {
      const { product_id, size_name, quantity = 0 } = req.body;
      
      if (!['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size_name)) {
        return res.status(400).json({ message: 'Недопустимое название размера' });
      }

      const result = await pool.query(
        'INSERT INTO sizes (product_id, size_name, quantity) VALUES ($1, $2, $3) RETURNING *',
        [product_id, size_name, quantity]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error adding size:', err.stack);
      res.status(400).json({ message: err.message });
    }
  });

  // Обновить количество для размера (только админ)
  router.put('/:sizeId', checkAdmin, async (req, res) => {
    try {
      const { sizeId } = req.params;
      const { quantity } = req.body;

      if (quantity < 0) {
        return res.status(400).json({ message: 'Количество не может быть отрицательным' });
      }

      const result = await pool.query(
        'UPDATE sizes SET quantity = $1 WHERE id = $2 RETURNING *',
        [quantity, sizeId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Размер не найден' });
      }

      res.json({ message: 'Количество обновлено', size: result.rows[0] });
    } catch (err) {
      console.error('Error updating size:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Удалить размер (только админ)
  router.delete('/:sizeId', checkAdmin, async (req, res) => {
    try {
      const { sizeId } = req.params;

      const result = await pool.query(
        'DELETE FROM sizes WHERE id = $1 RETURNING *',
        [sizeId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Размер не найден' });
      }

      res.json({ message: 'Размер удалён', size: result.rows[0] });
    } catch (err) {
      console.error('Error deleting size:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};



