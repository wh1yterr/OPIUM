import React from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 

const Header = ({ isAuthenticated, handleLogout }) => {
  const [userRole, setUserRole] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (err) {
        console.error('Ошибка декодирования токена:', err);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [isAuthenticated]); // Добавляем зависимость от isAuthenticated

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <Navbar collapseOnSelect expand="md" style={{ backgroundColor: '#000000', borderBottom: '1px solid #1a1a1a' }} variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontWeight: '900', fontSize: '1.8rem', letterSpacing: '3px', color: '#ffffff' }}>
          OPIUM
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" style={{ color: '#ffffff', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Главная</Nav.Link>
            {!isAuthenticated && <Nav.Link as={Link} to="/register" style={{ color: '#ffffff', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Регистрация</Nav.Link>}
            <Nav.Link as={Link} to="/products" style={{ color: '#ffffff', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Каталог</Nav.Link>
            {isAuthenticated && <Nav.Link as={Link} to="/profile" style={{ color: '#ffffff', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Профиль</Nav.Link>}
            {isAuthenticated && <Nav.Link as={Link} to="/cart" style={{ color: '#ffffff', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Корзина</Nav.Link>}
            {/* Вкладка "Админ" только для администраторов */}
            {isAuthenticated && userRole === 'admin' && (
              <Nav.Link as={Link} to="/admin" style={{ color: '#dc143c', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Админ</Nav.Link>
            )}
          </Nav>
          {isAuthenticated ? (
            <Button onClick={onLogout} style={{ backgroundColor: '#dc143c', border: 'none', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 20px' }}>
              Выйти
            </Button>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login" style={{ color: '#ffffff', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Войти</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;