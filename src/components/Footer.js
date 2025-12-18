// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>OPIUM</h5>
            <p>Streetwear в стиле Playboi Carti</p>
          </div>
          <div className="col-md-6 text-end">
            <ul className="list-unstyled">
              <li><Link to="/terms" className="text-white">Условия использования</Link></li>
              <li>Email: support@opium.store</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-3">
          <small>© {new Date().getFullYear()} OPIUM. Все права защищены.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;