import React, { useState, useEffect } from "react";
import { Container, Tabs, Tab, Table, Form, Pagination, Button, Row, Col } from "react-bootstrap";
import api from '../services/axiosConfig';
import { toast } from 'react-hot-toast';
import './Admin.css'

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    image: '',
    price: ''
  });
  
  const [editingProduct, setEditingProduct] = useState(null); 
  const [sizes, setSizes] = useState([]);
  const [selectedProductForSizes, setSelectedProductForSizes] = useState(null);
  const [newSize, setNewSize] = useState({ size_name: 'S', quantity: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Требуется авторизация');

        let decodedToken;
        try {
          const jwtDecode = require('jwt-decode');
          decodedToken = jwtDecode(token);
        } catch (e) {
          try {
            decodedToken = JSON.parse(atob(token.split('.')[1]));
          } catch (e2) {
            console.error('JWT decode failed', e, e2);
            throw e;
          }
        }
        if (decodedToken.role !== 'admin') {
          toast.error('Доступ только для администраторов');
          return;
        }

        const ordersResponse = await api.get('/orders/all');
        setOrders(ordersResponse.data);

        const productsResponse = await api.get('/products');
        setProducts(productsResponse.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Ошибка загрузки данных');
        console.error('Ошибка:', err.response || err);
      }
    };
    fetchData();
  }, []);

  // Загрузка размеров для выбранного продукта
  const fetchSizes = async (productId) => {
    try {
      if (!productId) return setSizes([]);
      const resp = await api.get(`/sizes/product/${productId}`);
      setSizes(resp.data);
    } catch (err) {
      toast.error('Ошибка загрузки размеров');
      console.error(err.response || err);
    }
  };

  useEffect(() => {
    if (selectedProductForSizes) fetchSizes(selectedProductForSizes);
    else setSizes([]);
  }, [selectedProductForSizes]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(order =>
        order.id === parseInt(orderId) ? { ...order, status } : order
      ));
      toast.success('Статус обновлён');
    } catch (err) {
      toast.error('Ошибка обновления статуса');
      console.error('Ошибка:', err.response || err);
    }
  };

  const updateProductQuantity = async (productId, quantity) => {
    try {
      const parsedQuantity = parseInt(quantity) || 0;
      if (parsedQuantity < 0) {
        toast.error('Количество не может быть отрицательным');
        return;
      }
      await api.put(`/products/${productId}/quantity`, { quantity: parsedQuantity });
      setProducts(products.map(product =>
        product.id === parseInt(productId) ? { ...product, quantity: parsedQuantity } : product
      ));
      toast.success('Количество обновлено');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка обновления количества');
      console.error('Ошибка:', err.response || err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = { ...newProduct, price: parseFloat(newProduct.price) || 0 };
      const response = await api.post('/products', productData);

      setProducts([...products, response.data]);
      setNewProduct({ name: '', description: '', image: '', price: '' });
      toast.success('Продукт успешно добавлен');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка добавления продукта');
      console.error('Ошибка:', err.response || err);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);

      setProducts(products.filter(product => product.id !== parseInt(productId)));
      toast.success(response.data.message || 'Продукт помечен как удалённый');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка удаления продукта');
      console.error('Ошибка:', err.response || err);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

return (
    <Container className="admin-container">
      <h2 className="mb-3 text-center">Админ-панель</h2>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="admin-tabs mb-2"
      >
        <Tab eventKey="sizes" title="Управление размерами">
          <Row className="mb-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label>Выберите продукт</Form.Label>
                <Form.Select value={selectedProductForSizes || ''} onChange={(e) => setSelectedProductForSizes(e.target.value || null)}>
                  <option value="">-- Выберите продукт --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {selectedProductForSizes ? (
            <>
              <Table striped bordered hover className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Размер</th>
                    <th>Остаток</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(size => (
                    <tr key={size.id}>
                      <td>{size.id}</td>
                      <td>{size.size_name}</td>
                      <td>{size.quantity}</td>
                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          defaultValue={size.quantity}
                          onBlur={async (e) => {
                            const q = parseInt(e.target.value) || 0;
                            try {
                              await api.put(`/sizes/${size.id}`, { quantity: q });
                              setSizes(sizes.map(s => s.id === size.id ? { ...s, quantity: q } : s));
                              toast.success('Количество размера обновлено');
                            } catch (err) {
                              toast.error('Ошибка обновления размера');
                              console.error(err.response || err);
                            }
                          }}
                          className="admin-input"
                        />
                        <Button variant="danger" size="sm" className="mt-2" onClick={async () => {
                          if (!window.confirm('Удалить размер?')) return;
                          try {
                            await api.delete(`/sizes/${size.id}`);
                            setSizes(sizes.filter(s => s.id !== size.id));
                            toast.success('Размер удалён');
                          } catch (err) {
                            toast.error('Ошибка удаления размера');
                            console.error(err.response || err);
                          }
                        }}>Удалить</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Form className="admin-form" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = { product_id: selectedProductForSizes, size_name: newSize.size_name, quantity: parseInt(newSize.quantity) || 0 };
                  const resp = await api.post('/sizes', payload);
                  setSizes([...sizes, resp.data]);
                  setNewSize({ size_name: 'S', quantity: 0 });
                  toast.success('Размер добавлен');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Ошибка добавления размера');
                  console.error(err.response || err);
                }
              }}>
                <Row>
                  <Col xs={12} sm={3} className="mb-2">
                    <Form.Group>
                      <Form.Label>Размер</Form.Label>
                      <Form.Select value={newSize.size_name} onChange={(e) => setNewSize({ ...newSize, size_name: e.target.value })}>
                        <option>XS</option>
                        <option>S</option>
                        <option>M</option>
                        <option>L</option>
                        <option>XL</option>
                        <option>XXL</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={3} className="mb-2">
                    <Form.Group>
                      <Form.Label>Остаток</Form.Label>
                      <Form.Control type="number" min="0" value={newSize.quantity} onChange={(e) => setNewSize({ ...newSize, quantity: e.target.value })} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={3} className="mb-2 d-flex align-items-end">
                    <Button type="submit" className="admin-button">Добавить размер</Button>
                  </Col>
                </Row>
              </Form>
            </>
          ) : (
            <p>Выберите продукт, чтобы управлять его размерами.</p>
          )}
        </Tab>
        <Tab eventKey="orders" title="Управление заказами">
          {orders.length === 0 ? (
            <p>Нет заказов для отображения</p>
          ) : (
            <>
              <Table
                striped
                bordered
                hover
                className="admin-table"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email пользователя</th>
                    <th>Общая сумма</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.user_email || "Не указано"}</td>
                      <td>{order.total_price} ₽</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{order.status}</td>
                      <td>
                        <Form.Select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="admin-select"
                        >
                          <option value="pending">Ожидает</option>
                          <option value="shipped">Отправлен</option>
                          <option value="delivered">Доставлен</option>
                          <option value="canceled">Отменён</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                className="justify-content-center mt-2 admin-pagination"
              >
                <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={nextPage} disabled={currentPage === totalPages} />
              </Pagination>
            </>
          )}
        </Tab>
        {/* Removed  */}
        <Tab eventKey="deleteProducts" title="Удаление продуктов">
          {products.length === 0 ? (
            <p>Нет продуктов для удаления</p>
          ) : (
            <Table
              striped
              bordered
              hover
              className="admin-table"
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.price} ₽</td>
                    <td>{product.quantity}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="admin-button"
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="addProduct" title="Добавление продукта">
          <Form onSubmit={handleAddProduct} className="admin-form">
            <Row>
              <Col xs={12} sm={6} className="mb-2">
                <Form.Group>
                  <Form.Label>Название</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} className="mb-2">
                <Form.Group>
                  <Form.Label>Цена (₽)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} className="mb-2">
                <Form.Group>
                  <Form.Label>Изображение (URL)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} className="mb-2">
                <Form.Group>
                  <Form.Label>Описание</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} className="text-center">
                <Button
                  variant="success"
                  type="submit"
                  className="admin-button"
                >
                  Добавить продукт
                </Button>
              </Col>
            </Row>
          </Form>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Admin;