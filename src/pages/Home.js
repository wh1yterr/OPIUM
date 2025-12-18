import React from "react";
import { Container } from "react-bootstrap";
import "./Home.css";

const Home = () => {
  return (
    <Container className="home-container">
      <div className="home-header">
        <h1 className="display-4">OPIUM</h1>
        <p className="lead">Premium Streetwear Collection</p>
      </div>
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
  <img
    src="https://media3.giphy.com/media/v1.Y2lkPTZjMDliOTUyNnAzaDQ4eHhiMGQxYjd1dnp4N2l2ZWs5bW84bmxkeGJ3dXZrdmM2NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/T018dVETg6MaHwjShq/giphy.gif"  // ← Замени эту строку на свою реальную ссылку, например: https://media.giphy.com/media/abc123/giphy.gif
    alt="Анимация на главной странице"
    width="480"
    height="270"
    loading="lazy"
    style={{
      maxWidth: '100%',          // Делает GIF адаптивным на мобильных устройствах
      height: 'auto',
      borderRadius: '12px',      // Опционально: скруглённые углы
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'  // Опционально: лёгкая тень
    }}
  />
</div>
    </Container>
    
  );
};

export default Home;
