import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium', showTagline = false }) => {
  return (
    <div className={`logo-container ${size}`}>
      <h1 className="brand-title">
        Solar<span className="brand-highlight">AI</span>
      </h1>
      {showTagline && (
        <p className="brand-tagline">Intelligent Solar Panel Management</p>
      )}
    </div>
  );
};

export default Logo; 