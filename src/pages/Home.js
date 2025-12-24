import React from "react";
import { Container } from "react-bootstrap";
import "./Home.css";

const Home = () => {
  return (
    <Container className="home-container">
      <div className="home-video-wrap">
        <video autoPlay muted loop playsInline className="home-bg-video" poster="/videos/bg-poster.jpg">
          <source src="/videos/bg.mp4" type="video/mp4" />
          Ваш браузер не поддерживает видео на фоне.
        </video>
      </div>
      <div className="home-header">
        <h1 className="display-4">OPIUM</h1>
        <p className="lead">Premium Streetwear Collection</p>
      </div>
      <div className="home-lyrics">
        <p>The O stand for ostrich, the Hermès bag came pink</p>
        <p>The P stand for Percocet, I just threw back like three</p>
        <p>And the I stand for international, got Europe freaks</p>
        <p>She ask me what U and M stand for, that's you and me</p>
      </div>
    </Container>
  );
};

export default Home;
