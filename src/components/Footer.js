import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>SolarAI</h3>
          <p>Advanced AI-powered monitoring and optimization for solar panel installations.</p>
        </div>
        
        <div className="footer-section">
          <h3>Features</h3>
          <ul>
            <li>Real-time panel monitoring</li>
            <li>AI maintenance predictions</li>
            <li>Performance analytics</li>
            <li>Thermal visualization</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: info@solarai.tech</p>
          <p>Phone: (555) 123-4567</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} SolarAI. All rights reserved.</p>
        <p>Version 1.0</p>
      </div>
    </footer>
  );
};

export default Footer; 