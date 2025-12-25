import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import api from '../services/axiosConfig';
import { toast } from "react-hot-toast";
import "./Products.css"; // Подключение CSS

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [productSizes, setProductSizes] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products anonymously (server allows public GET)
        const response = await api.get(`/products`);

        setProducts(response.data);
        
        // Загружаем размеры для каждого продукта
        const sizesPromises = response.data.map(async (product) => {
          try {
            const resp = await api.get(`/sizes/product/${product.id}`);
            return resp.data;
          } catch (err) {
            // Если 401 — пользователь не авторизован, просто вернём пустой список размеров
            if (err.response?.status === 401) return [];
            // Иначе пробросим ошибку дальше
            throw err;
          }
        });
        
        const sizesResponses = await Promise.all(sizesPromises);
        const sizesData = {};
        response.data.forEach((product, index) => {
          sizesData[product.id] = sizesResponses[index].data;
        });
        
        setProductSizes(sizesData);
        setLoading(false);
      } catch (err) {
        toast.error("Ошибка при загрузке продуктов");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSizeSelect = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: sizeId,
    }));
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Требуется авторизация");
        return;
      }

      const sizeId = selectedSizes[productId];
      if (!sizeId) {
        toast.error("Пожалуйста, выберите размер");
        return;
      }

      const response = await api.post(`/cart`, { productId, sizeId, quantity: 1 });

      toast.success(response.data.message);
      setSelectedSizes((prev) => ({ ...prev, [productId]: null }));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Ошибка при добавлении в корзину"
      );
      console.error("Ошибка добавления в корзину:", err);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <Container className="products-container">
      <h2 className="products-title">НАШИ ПРОДУКТЫ</h2>
      <Row>
        {products.map((product) => (
          <Col key={product.id} xs={12} sm={6} md={4} className="mb-4">
            <div className="product-card">
              <div className="product-image-wrapper">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-overlay"></div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">{product.price} ₽</div>
                
                <div className="product-actions">
                  <div className="size-section">
                    <label className="size-label">ВЫБЕРИТЕ РАЗМЕР</label>
                    <div className="size-selector">
                      {productSizes[product.id] && productSizes[product.id].length > 0 ? (
                        productSizes[product.id].map((size) => (
                          <button
                            key={size.id}
                            className={`size-btn ${
                              selectedSizes[product.id] === size.id ? 'selected' : ''
                            } ${size.quantity === 0 ? 'out-of-stock' : ''}`}
                            onClick={() => handleSizeSelect(product.id, size.id)}
                            disabled={size.quantity === 0}
                          >
                            {size.size_name}
                            {size.quantity === 0 && <span className="sold-out">✕</span>}
                          </button>
                        ))
                      ) : (
                        <p className="no-sizes">Размеры скоро появятся</p>
                      )}
                    </div>
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product.id)}
                  >
                    ДОБАВИТЬ В КОРЗИНУ
                  </button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Products;