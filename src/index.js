import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { getAuth, signOut } from 'firebase/auth';
import './config/firebase'; // Import to initialize Firebase

// Force signout on app startup
const auth = getAuth();
if (auth.currentUser) {
  console.log('index.js: User is logged in on startup, force signing out:', auth.currentUser.email);
  signOut(auth).then(() => {
    console.log('index.js: User forcefully signed out on startup');
  }).catch(error => {
    console.error('index.js: Error signing out user on startup:', error);
  });
} else {
  console.log('index.js: No user logged in on startup');
}

// Clear any existing Firebase auth sessions
try {
  // Clear localStorage items related to Firebase auth
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('firebase:')) {
      console.log('index.js: Removing localStorage item:', key);
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage items related to Firebase auth
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('firebase:')) {
      console.log('index.js: Removing sessionStorage item:', key);
      sessionStorage.removeItem(key);
    }
  });

  // Explicitly set a flag to indicate we're forcing a fresh auth state
  sessionStorage.setItem('auth_reset', Date.now().toString());
  
  console.log('index.js: Cleared Firebase auth from storage');
} catch (error) {
  console.error('index.js: Failed to clear storage:', error);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
