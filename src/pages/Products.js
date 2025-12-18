import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Products.css"; // Подключение CSS

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Требуется авторизация");
        }

        const response = await axios.get(
          `https://opium-2-igrl.onrender.com/api/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        toast.error("Ошибка при загрузке продуктов");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value > 0 ? value : 1,
    }));
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Требуется авторизация");
        return;
      }

      const quantity = quantities[productId] || 1;
      const response = await axios.post(
        `https://opium-2-igrl.onrender.com/api/cart`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
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
                  <div className="quantity-section">
                    <label className="quantity-label">КОЛИЧЕСТВО</label>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            product.id,
                            (quantities[product.id] || 1) - 1
                          )
                        }
                        disabled={(quantities[product.id] || 1) <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={quantities[product.id] || 1}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                      />
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            product.id,
                            (quantities[product.id] || 1) + 1
                          )
                        }
                      >
                        +
                      </button>
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