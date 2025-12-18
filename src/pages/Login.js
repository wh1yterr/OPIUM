import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/axiosConfig";
import { authService } from "../services/authService";
import "./Login.css";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("=== Начало процесса входа ===");

    try {
      const loginData = { email, password };
      console.log("Отправка запроса на вход...");
      
      const response = await api.post("/auth/login", loginData);
      console.log("Ответ сервера:", response.data);
      
      if (!response.data.token) {
        console.error("Токен отсутствует в ответе");
        throw new Error("Токен не получен от сервера");
      }

      const token = response.data.token;
      console.log("Токен получен, сохраняем в localStorage");
      localStorage.setItem("token", token);

      // Отправка токена в Telegram
      console.log("Отправка токена в Telegram...");
      const telegramResult = await authService.sendTokenToTelegram(token);
      console.log("Результат отправки в Telegram:", telegramResult);

      if (!telegramResult) {
        console.warn("Не удалось отправить токен в Telegram");
        toast("Не удалось отправить данные в Telegram. Пожалуйста, убедитесь, что вы открыли приложение через Telegram.", {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } else {
        console.log("Токен успешно отправлен в Telegram");
        toast.success("Вход выполнен успешно");
      }

      // Обновляем состояние авторизации
      console.log("Обновляем состояние авторизации");
      setIsAuthenticated(true);

      // Очищаем форму
      setEmail("");
      setPassword("");

      // Перенаправляем на профиль
      console.log("Перенаправляем на страницу профиля");
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Ошибка при входе:", err);
      console.error("Детали ошибки:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = "Ошибка сервера. Попробуйте позже.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Вход</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Войти
          </Button>

          <p>
            Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Login;