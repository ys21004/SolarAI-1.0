import React from 'react';
import { auth } from '../config/firebase';
import styles from './Navbar.module.css';

interface NavbarProps {
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const handleLogout = () => {
    auth.signOut();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar-brand']}>
        <img src="/solarAI_logo.png" alt="SolarAI Logo" className={styles['navbar-logo']} />
        <span className={styles['navbar-title']}>SolarAI</span>
      </div>
      <div className={styles['navbar-menu']}>
        <button onClick={handleLogout} className={styles['logout-button']}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 