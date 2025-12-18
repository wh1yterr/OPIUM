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
    </Container>
  );
};

export default Home;
