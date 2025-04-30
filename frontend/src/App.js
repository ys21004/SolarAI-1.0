import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { PanelsProvider } from './context/PanelsContext.js';
import { AuthProvider } from './context/AuthContext.js';
import MainLayout from './components/MainLayout.js';
import PrivateRoute from './components/PrivateRoute.js';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import MaintenanceHistory from './pages/MaintenanceHistory.js';
import Analytics from './pages/Analytics.js';
import Settings from './pages/Settings.js';
import AIMaintenanceCheck from './pages/AIMaintenanceCheck.js';
import Footer from './components/Footer.js';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
      <PanelsProvider>
        <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                      <MainLayout>
                        <div style={{ flex: 1 }}>
                          <Dashboard />
                        </div>
                      </MainLayout>
                      <Footer />
                    </div>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/maintenance-history" 
                element={
                  <PrivateRoute>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                      <MainLayout>
                        <div style={{ flex: 1 }}>
                          <MaintenanceHistory />
                        </div>
                      </MainLayout>
                      <Footer />
                    </div>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/ai-maintenance" 
                element={
                  <PrivateRoute>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                      <MainLayout>
                        <div style={{ flex: 1 }}>
                          <AIMaintenanceCheck />
                        </div>
                      </MainLayout>
                      <Footer />
                    </div>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <PrivateRoute>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                      <MainLayout>
                        <div style={{ flex: 1 }}>
                          <Analytics />
                        </div>
                      </MainLayout>
                      <Footer />
                    </div>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                      <MainLayout>
                        <div style={{ flex: 1 }}>
                          <Settings />
                        </div>
                      </MainLayout>
                      <Footer />
                    </div>
                  </PrivateRoute>
                } 
              />
              
              {/* Catch-all redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
      </PanelsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 