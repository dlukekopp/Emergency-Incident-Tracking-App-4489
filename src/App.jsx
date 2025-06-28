import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Personnel from './pages/Personnel';
import Resources from './pages/Resources';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import UserManagement from './components/UserManagement';
import SystemConfiguration from './components/SystemConfiguration';
import IncidentDetail from './pages/IncidentDetail';
import { IncidentProvider } from './context/IncidentContext';
import { authManager } from './utils/authManager';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configVersion, setConfigVersion] = useState(0);

  useEffect(() => {
    // Initialize auth manager and check for existing session
    authManager.initializeUsers();
    const user = authManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);

    // Apply saved color scheme
    applyColorScheme();

    // Listen for storage changes to update config
    const handleStorageChange = () => {
      setConfigVersion(prev => prev + 1);
      // Reapply color scheme when config changes
      applyColorScheme();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const applyColorScheme = () => {
    const config = authManager.getSystemConfig();
    if (config.primaryColor) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', config.primaryColor);
      root.style.setProperty('--secondary-color', config.secondaryColor || '#991b1b');
      root.style.setProperty('--accent-color', config.accentColor || '#fef2f2');
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authManager.logout();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-theme w-8 h-8"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} key={configVersion} />;
  }

  return (
    <IncidentProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
            key={configVersion} // Force re-render when config changes
          />
          <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <motion.main
              className="flex-1 overflow-auto p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/incidents/:id" element={<IncidentDetail />} />
                <Route path="/personnel" element={<Personnel />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/profile" element={<Profile />} />
                {authManager.hasPermission('canViewReports') && (
                  <Route path="/reports" element={<Reports />} />
                )}
                {authManager.hasPermission('canManageUsers') && (
                  <Route path="/users" element={<UserManagement />} />
                )}
                {authManager.isSuperAdmin() && (
                  <Route path="/admin" element={<SystemConfiguration />} />
                )}
              </Routes>
            </motion.main>
          </div>
        </div>
      </Router>
    </IncidentProvider>
  );
}

export default App;