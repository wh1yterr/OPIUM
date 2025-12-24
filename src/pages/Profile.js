import React, { useState, useEffect } from "react";
import { Container, Button, Table, Card, Row, Col, Pagination } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Profile.css"; // Подключение CSS

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Требуется авторизация");

        const userResponse = await axios.get(
          `https://opium-2-igrl.onrender.com/api/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(userResponse.data.user);

        const ordersResponse = await axios.get(
          `https://opium-2-igrl.onrender.com/api/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(ordersResponse.data);
      } catch (err) {
        toast.error("Ошибка загрузки данных профиля или заказов");
        console.error("Ошибка:", err.response || err);
      }
    };
    fetchProfileData();
  }, []);

  // адрес доставки теперь указывается при оформлении заказа в корзине

  return (
    <Container className="profile-container">
      <h2 className="profile-title">Профиль пользователя</h2>

      {user && (
        <Card className="profile-card">
          <Card.Header>Информация о пользователе</Card.Header>
          <Card.Body>
            <Row className="profile-info">
              <Col xs={12} md={6}>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </Col>
              <Col xs={12} md={6}>
                <p>
                  <strong>Имя:</strong> {user.contact_face || "Не указано"}
                </p>
              </Col>
              <Col xs={12} md={6}>
                <p>
                  <strong>Телефон:</strong> {user.phone || "Не указан"}
                </p>
              </Col>
              {/* Адрес доставки убран из профиля — указывается при оформлении в корзине */}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Адрес доставки удалён из профиля */}

      <Card className="profile-card">
        <Card.Header>Мои заказы</Card.Header>
        <Card.Body>
          {orders.length === 0 ? (
            <p>У вас нет заказов</p>
          ) : (
            <>
              <Table
                striped
                bordered
                hover
                responsive
                className="profile-orders-table"
              >
                <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Общая сумма</th>
                        <th>Статус</th>
                        <th>Товары</th>
                      </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{order.total_price} ₽</td>
                      <td>{order.status}</td>
                      <td>
                        <ul className="mb-0 ps-3">
                          {order.items.map((item) => (
                            <li key={item.product_id}>
                              {item.name} — {item.quantity} шт. по {item.price_at_order} ₽
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* Mobile-friendly cards (shown via CSS on small screens) */}
              <div className="profile-orders-cards">
                {paginatedOrders.map((order) => (
                  <Card key={order.id} className="mb-3 profile-order-card">
                    <Card.Body>
                      <Card.Title>Заказ #{order.id} — {new Date(order.created_at).toLocaleDateString()}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">Сумма: {order.total_price} ₽ — Статус: {order.status}</Card.Subtitle>
                      <ul className="mb-0 mt-2">
                        {order.items.map((item) => (
                          <li key={item.product_id}>{item.name} — {item.quantity} шт. по {item.price_at_order} ₽</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              <Pagination className="justify-content-center mt-2">
                <Pagination.Prev onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
              </Pagination>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;