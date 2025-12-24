import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import { jwtDecode } from "jwt-decode";
import { Toaster, ToastContainer } from "react-hot-toast";
import axios from "axios";
import { authService } from "./services/authService";
import { Spinner } from "react-bootstrap";

// Компонент защищённого маршрута для админа
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.role !== "admin") {
      return <Navigate to="/profile" />;
    }
    return children;
  } catch (err) {
    console.error("Ошибка декодирования токена:", err);
    return <Navigate to="/login" />;
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для проверки инициализации Telegram WebApp
  const checkTelegramWebApp = () => {
    try {
      if (!window?.Telegram?.WebApp) return false;
      return Boolean(window.Telegram.WebApp.initData);
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // Проверяем инициализацию Telegram WebApp
    const isInitialized = checkTelegramWebApp();

    const token = localStorage.getItem("token");
    if (token) {
      authService.verifyToken(token)
        .then((isValid) => {
          setIsAuthenticated(isValid);
          if (isValid) {
            return authService.checkAdminStatus(token);
          }
          return false;
        })
        .then((isAdminUser) => {
          setIsAdmin(isAdminUser);
          setIsLoading(false);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Функция выхода из системы
  const handleLogout = async () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    
    if (window.Telegram?.WebApp) {
      try {
        await window.Telegram.WebApp.sendData(
          JSON.stringify({ action: "logout" })
        );
        window.Telegram.WebApp.close();
      } catch (error) {
        console.error("Error sending logout data:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner animation="border" role="status" variant="warning" style={{ width: 60, height: 60 }}>
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Toaster position="top-center" />
        <Header
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
        />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated ? (
                  <Register setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
            <Route path="/products" element={<Products />} />
            <Route
              path="/cart"
              element={
                isAuthenticated ? (
                  <Cart />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin"
              element={
                isAuthenticated && isAdmin ? (
                  <Admin />
                ) : (
                  <Navigate to="/profile" />
                )
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;