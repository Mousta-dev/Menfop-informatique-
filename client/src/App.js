import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import { Container, Button, Offcanvas, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Home from './components/Home';
import Establishments from './components/Establishments';
import NewEquipment from './components/NewEquipment';
import DamagedEquipment from './components/DamagedEquipment';
import FunctionalEquipment from './components/FunctionalEquipment';
import ManageEquipment from './components/ManageEquipment';
import Rapport from './components/Rapport';
import ReportsList from './components/ReportsList';
import ReportView from './components/ReportView';
import MissionForm from './components/MissionForm';
import MissionsList from './components/MissionsList';
import MissionView from './components/MissionView';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import './App.css';

const AppContent = () => {
  const { t, i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));
  const [userRole, setUserRole] = useState(sessionStorage.getItem('role'));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserRole(null);
    setShowMobileMenu(false);
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const ThemeToggle = () => (
    <Button className="theme-toggle-btn mb-2" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-moon-fill" viewBox="0 0 16 16">
          <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sun-fill" viewBox="0 0 16 16">
          <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
        </svg>
      )}
      <span className="ms-2">{theme === 'light' ? t('sidebar.dark_mode') || 'Sombre' : t('sidebar.light_mode') || 'Clair'}</span>
    </Button>
  );

  const SidebarContent = () => {
    const username = sessionStorage.getItem('username');
    return (
      <>
        <div className="sidebar-header flex-column align-items-stretch">
          <div className="d-flex align-items-center mb-3">
            <Link to="/" className="text-decoration-none d-flex align-items-center" onClick={() => setShowMobileMenu(false)}>
              <img src="/menfop.png" alt="Logo" className="sidebar-logo" />
              <span className="navbar-brand mb-0 h1">Menfop-infos</span>
            </Link>
          </div>
          {isAuthenticated && (
            <div className="user-profile-badge mb-3">
              <div className="user-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                </svg>
              </div>
              <div className="user-info">
                <span className="user-name text-truncate">{username}</span>
                <span className="user-role-label">{userRole}</span>
              </div>
            </div>
          )}
        </div>
        <div className="sidebar-content">
          <ThemeToggle />
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.dashboard')}
          </NavLink>
          <NavLink to="/establishments" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.establishments')}
          </NavLink>
          <NavLink to="/manage-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.manage_equipment')}
          </NavLink>
          <NavLink to="/new-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.new_equipment')}
          </NavLink>
          <NavLink to="/damaged-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.damaged_equipment')}
          </NavLink>
          <NavLink to="/functional-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.functional_equipment')}
          </NavLink>
          <NavLink to="/new-mission" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.new_mission')}
          </NavLink>
          <NavLink to="/missions" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.view_missions')}
          </NavLink>
          <NavLink to="/rapport" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.write_report')}
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            {t('sidebar.view_reports')}
          </NavLink>
          {userRole === 'administrateur' && (
            <NavLink to="/users" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} text-danger`} onClick={() => setShowMobileMenu(false)}>
              {t('sidebar.user_management')}
            </NavLink>
          )}
        </div>
        <div className="sidebar-footer">
          <Button variant="outline-danger" className="w-100 rounded-pill" onClick={handleLogout}>
            {t('sidebar.logout')}
          </Button>
        </div>
      </>
    );
  };

  const Footer = () => (
    <footer className="site-footer">
      <p className="mb-0">{t('common.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );

  if (location.pathname === '/login' && !isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-lang-switcher">
          <ThemeToggle />
        </div>
        <div className="flex-grow-1">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar for Desktop */}
      {isAuthenticated && (
        <aside className="sidebar d-none d-lg-flex">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Header */}
      {isAuthenticated && (
        <div className="mobile-header d-lg-none">
          <Link to="/" className="text-decoration-none d-flex align-items-center">
            <img src="/menfop.png" alt="Logo" width="30" height="30" className="me-2" />
            <span className="navbar-brand mb-0 h1" style={{ fontSize: '1.2rem' }}>Menfop-infos</span>
          </Link>
          <div className="d-flex align-items-center">
             <Button variant="link" className="text-dark p-0 me-3" onClick={toggleTheme}>
               {theme === 'light' ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-moon-fill" viewBox="0 0 16 16">
                   <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-sun-fill" viewBox="0 0 16 16">
                   <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                 </svg>
               )}
             </Button>
            <Button variant="link" className="text-dark p-0" onClick={() => setShowMobileMenu(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar (Offcanvas) */}
      <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)} className="sidebar-mobile">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="d-flex flex-column h-100">
            <SidebarContent />
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-wrapper flex-grow-1">
          <Container fluid>
            <Routes>
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/establishments" element={<PrivateRoute><Establishments userRole={userRole} /></PrivateRoute>} />
              <Route path="/new-equipment" element={<PrivateRoute><NewEquipment /></PrivateRoute>} />
              <Route path="/damaged-equipment" element={<PrivateRoute><DamagedEquipment /></PrivateRoute>} />
              <Route path="/functional-equipment" element={<PrivateRoute><FunctionalEquipment /></PrivateRoute>} />
              <Route path="/manage-equipment" element={<PrivateRoute><ManageEquipment userRole={userRole} /></PrivateRoute>} />
              <Route path="/rapport" element={<PrivateRoute><Rapport /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><ReportsList /></PrivateRoute>} />
              <Route path="/reports/:id" element={<PrivateRoute><ReportView /></PrivateRoute>} />
              <Route path="/new-mission" element={<PrivateRoute><MissionForm /></PrivateRoute>} />
              <Route path="/missions" element={<PrivateRoute><MissionsList /></PrivateRoute>} />
              <Route path="/missions/:id" element={<PrivateRoute><MissionView /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute>{userRole === 'administrateur' ? <UserManagement /> : <Navigate to="/" />}</PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
        </div>
        <Footer />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
