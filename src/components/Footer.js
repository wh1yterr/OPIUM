// Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#000000', borderTop: '1px solid #1a1a1a', padding: '40px 0', marginTop: '80px' }}>
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5 style={{ fontWeight: '900', fontSize: '1.5rem', letterSpacing: '3px', color: '#ffffff', marginBottom: '15px' }}>OPIUM</h5>
            <p style={{ color: '#888888', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Premium Streetwear Collection</p>
          </div>
          <div className="col-md-6 text-end">
            <ul className="list-unstyled">
              <li style={{ color: '#888888', fontSize: '0.9rem', marginBottom: '10px' }}>Email: support@opium.store</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-4" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '20px' }}>
          <small style={{ color: '#666666', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>© {new Date().getFullYear()} OPIUM. ALL RIGHTS RESERVED.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;