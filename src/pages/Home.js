import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Home.css";

const Home = () => {
  return (
    <Container className="home-container">
      <div className="home-header">
        <h1 className="display-4">OPIUM</h1>
        <p className="lead">Streetwear в стиле Playboi Carti</p>
      </div>

      {/* Преимущества */}
      <Row className="home-advantages mb-5 text-center">
        <Col md={4} sm={6} className="mb-4">
          <div className="card">
            <h3>🔥 Эксклюзивные дизайны</h3>
            <p>
              Уникальная одежда в стиле Playboi Carti. Ограниченные коллекции 
              и эксклюзивные модели, которые вы не найдете больше нигде.
            </p>
          </div>
        </Col>
        <Col md={4} sm={6} className="mb-4">
          <div className="card">
            <h3>✨ Качество премиум</h3>
            <p>Только лучшие материалы и внимание к деталям. Каждая вещь создана с заботой о комфорте и стиле.</p>
          </div>
        </Col>
        <Col md={4} sm={6} className="mb-4">
          <div className="card">
            <h3>🚚 Быстрая доставка</h3>
            <p>Быстрая и надежная доставка по всей России. Получите свой заказ в кратчайшие сроки.</p>
          </div>
        </Col>
      </Row>

      {/* Коллекции */}
      <div className="home-collections text-center">
        <h2 className="mb-4">НАШИ КОЛЛЕКЦИИ</h2>
        <Row>
          <Col md={3} sm={6} className="collection-item mb-4">
            <div className="collection-card">
              <h4>HOODIES</h4>
              <p>Удобные худи с уникальными принтами</p>
            </div>
          </Col>
          <Col md={3} sm={6} className="collection-item mb-4">
            <div className="collection-card">
              <h4>T-SHIRTS</h4>
              <p>Классические и оверсайз футболки</p>
            </div>
          </Col>
          <Col md={3} sm={6} className="collection-item mb-4">
            <div className="collection-card">
              <h4>PANTS</h4>
              <p>Штаны и джоггеры в уличном стиле</p>
            </div>
          </Col>
          <Col md={3} sm={6} className="collection-item mb-4">
            <div className="collection-card">
              <h4>ACCESSORIES</h4>
              <p>Аксессуары для завершения образа</p>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Home;
