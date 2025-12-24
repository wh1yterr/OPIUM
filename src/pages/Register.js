import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Login.css";

const Register = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendTokenToTelegram = (token) => {
    try {
      if (window?.Telegram?.WebApp) {
        const data = { action: "auth", token };
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        return true;
      }
    } catch (e) {
      // ignore Telegram errors silently
    }
    return false;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `https://opium-2-igrl.onrender.com/api/auth/register`,
        formData
      );

      // Если регистрация успешна, выполняем вход
      const loginResponse = await axios.post(
        `https://opium-2-igrl.onrender.com/api/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Сохраняем токен
      const token = loginResponse.data.token;
      localStorage.setItem("token", token);

      // Отправляем токен в Telegram
      sendTokenToTelegram(token);

      // Обновляем состояние авторизации
      setIsAuthenticated(true);

      // Перенаправляем на профиль
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Ошибка сервера. Попробуйте позже.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Регистрация</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите email"
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Полное имя</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Имя Фамилия"
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Телефон</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 999-99-99"
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Зарегистрироваться
          </Button>

          <p>
            Уже есть аккаунт? <Link to="/login">Войдите</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Register;