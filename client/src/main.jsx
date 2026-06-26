import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginBox from './Components/LoginBox.jsx'
import UserDatabase from './Components/UserDatabase.jsx'
import McpApiKeys from './Components/McpApiKeys.jsx'
import useAppState from './hooks/useAppState.js'

function Root() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('calculator'); // 'calculator' or 'admin'
  const [adminTab, setAdminTab] = useState('users'); // 'users' or 'apikeys'

  // Use the custom hook for state management
  const {
    appState,
    updateState,
    getChartSensitivity,
    isOutOfOperationalRange
  } = useAppState();

  // Check if user is Admin
  const isAdmin = appState?. role === 'Admin';

  // Handle navigation to admin panel
  const navigateToAdmin = () => {
    if (! isAdmin) {
      alert('Access Denied: Admin privileges required');
      return;
    }
    window.location.hash = '#/admin';
    setCurrentView('admin');
  };

  const navigateToCalculator = () => {
    window.location.hash = '';
    setCurrentView('calculator');
  };

  // Check URL hash for admin route
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash;

      if (hash === '#/admin') {
        // Only allow access if user is admin
        if (!loggedIn) {
          // Not logged in - will show login box
          return;
        }

        if (! isAdmin) {
          // Logged in but not admin - deny access
          alert('Access Denied: Admin privileges required');
          window.location.hash = '';
          setCurrentView('calculator');
          return;
        }

        // Admin user - allow access
        setCurrentView('admin');
      } else {
        setCurrentView('calculator');
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, [loggedIn, isAdmin]);

  // Protect admin view - if user loses admin privileges or logs out
  useEffect(() => {
    if (currentView === 'admin' && (! loggedIn || ! isAdmin)) {
      navigateToCalculator();
    }
  }, [currentView, loggedIn, isAdmin]);

  return (
      <>
        {! loggedIn && (
            <LoginBox
                onLoginSuccess={() => setLoggedIn(true)}
                appState={appState}
                updateState={updateState}
                onClose={() => window.close()}
            />
        )}

        {loggedIn && currentView === 'calculator' && (
            <>
              <App
                  appState={appState}
                  updateState={updateState}
                  getChartSensitivity={getChartSensitivity}
                  isOutOfOperationalRange={isOutOfOperationalRange}
              />
              {/* Admin Panel Access Button - Only visible to Admin users */}
              {isAdmin && (
                  <button
                      className="admin-panel-fab"
                      onClick={navigateToAdmin}
                      title="User Management"
                  >
                    👤
                  </button>
              )}
            </>
        )}

        {loggedIn && currentView === 'admin' && isAdmin && (
            <>
              {/* Admin tab bar */}
              <div className="admin-tabs">
                <button
                    className={`admin-tab ${adminTab === 'users' ? 'active' : ''}`}
                    onClick={() => setAdminTab('users')}
                >
                  👤 Users
                </button>
                <button
                    className={`admin-tab ${adminTab === 'apikeys' ? 'active' : ''}`}
                    onClick={() => setAdminTab('apikeys')}
                >
                  🔑 MCP API Keys
                </button>
              </div>

              {adminTab === 'users' && (
                  <UserDatabase
                      appState={appState}
                      onBack={navigateToCalculator}
                  />
              )}
              {adminTab === 'apikeys' && (
                  <McpApiKeys
                      appState={appState}
                      onBack={navigateToCalculator}
                  />
              )}
            </>
        )}
      </>
  );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Root />
    </StrictMode>
);