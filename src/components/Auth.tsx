import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import styles from './Auth.module.css';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set document title and ensure user is signed out when component mounts
  useEffect(() => {
    document.title = 'SolarAI - Secure Login';
    
    // Ensure user is signed out when Auth component mounts
    const ensureSignedOut = async () => {
      try {
        console.log('Auth component: Ensuring user is signed out');
        await signOut(auth);
        console.log('Auth component: User signed out successfully');
        
        // Clear any Firebase auth data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('firebase:')) {
            localStorage.removeItem(key);
          }
        });
        
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('firebase:')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Auth component: Error signing out:', error);
      }
    };
    
    ensureSignedOut();
    
    return () => {
      document.title = 'SolarAI Dashboard';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Auth component: Attempting to sign in with:', email);

    try {
      console.log('Auth component: Signing in...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Auth component: Sign in successful');
      onLogin();
    } catch (err: any) {
      console.error('Auth component: Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(`Failed to login: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1>SolarAI</h1>
        <h2>Secure Login</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className={styles.testCredentials}>
          <p>Demo credentials: test@example.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Auth; 