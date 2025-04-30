import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SolarMaintenanceForm from './components/SolarMaintenanceForm';
import Auth from './components/Auth';
import Logo from './components/Logo';
import Footer from './components/Footer';
import { firebaseService } from './services/firebaseService';
import PanelCharts from './components/PanelCharts';
import useAuth from './hooks/useAuth';

function App() {
  console.log('App component: Initializing...');
  
  // Use the custom auth hook
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(null);

  // After auth is initialized, handle loading state
  useEffect(() => {
    if (!authLoading) {
      console.log('App component: Auth loading complete, isAuthenticated:', isAuthenticated);
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  // Handle panel data subscription when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('App component: User authenticated, setting up panel subscription');
      const unsubscribe = firebaseService.subscribeToPanelUpdates((updatedPanels) => {
        console.log('App component: Received panel updates:', updatedPanels.length);
        setPanels(updatedPanels);
        if (selectedPanel) {
          const updatedSelectedPanel = updatedPanels.find(p => p.id === selectedPanel.id);
          if (updatedSelectedPanel) {
            setSelectedPanel(updatedSelectedPanel);
          }
        }
      });

      return () => {
        console.log('App component: Cleaning up panel subscription');
        unsubscribe();
      };
    } else {
      console.log('App component: User not authenticated, not setting up panel subscription');
    }
  }, [isAuthenticated, selectedPanel]);

  const handleLogout = async () => {
    try {
      console.log('App component: Handling logout');
      setIsLoading(true);
      await logout();
      console.log('App component: User signed out successfully');
      setActiveTab('dashboard');
      setPanels([]);
      setSelectedPanel(null);
    } catch (error) {
      console.error('App component: Error signing out:', error);
    } finally {
      setIsLoading(false);
      }
  };

  const renderDashboard = () => (
    <div className="dashboard-container">
      <Dashboard 
        panels={panels} 
        maintenanceHistory={[]} // In a real app, you would fetch maintenance history
      />
      <PanelCharts panels={panels} />
    </div>
  );

  const renderSolarMaintenance = () => (
    <SolarMaintenanceForm
      panels={panels}
      selectedPanel={selectedPanel}
      onPanelSelect={setSelectedPanel}
    />
  );

  if (isLoading || authLoading) {
    console.log('App component: Still loading, showing loading screen');
    return (
      <div className="loading-container">
        <Logo />
        <div className="loading-spinner"></div>
      </div>
    );
  }

  console.log('App component: Rendering main UI, isAuthenticated:', isAuthenticated);
  return (
    <div className="App">
      {!isAuthenticated ? (
        <>
          <Auth onLogin={() => {
            console.log('App component: onLogin callback invoked');
            // Note: Auth state will be updated by the hook
          }} />
          <Footer />
        </>
      ) : (
        <div className="main-container">
          <nav className="navbar">
            <Logo />
            <div className="nav-links">
              <button 
                className={activeTab === 'dashboard' ? 'active' : ''} 
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={activeTab === 'maintenance' ? 'active' : ''} 
                onClick={() => setActiveTab('maintenance')}
              >
                Maintenance
              </button>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </nav>

          <main className="content">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'maintenance' && renderSolarMaintenance()}
          </main>
          
          <Footer />
        </div>
      )}
    </div>
  );
}

export default App;
