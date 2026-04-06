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
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
    setShowMobileMenu(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const SidebarContent = () => (
    <>
      <div className="sidebar-header flex-column align-items-stretch">
        <div className="d-flex align-items-center mb-3">
          <Link to="/" className="text-decoration-none d-flex align-items-center" onClick={() => setShowMobileMenu(false)}>
            <img src="/menfop.png" alt="Logo" className="sidebar-logo" />
            <span className="navbar-brand mb-0 h1">Menfop-infos</span>
          </Link>
        </div>
        <ButtonGroup size="sm" className="w-100 mb-2">
          <Button 
            variant={i18n.language === 'fr' ? 'primary' : 'outline-primary'} 
            onClick={() => changeLanguage('fr')}
            style={{ fontSize: '0.7rem' }}
          >
            FR
          </Button>
          <Button 
            variant={i18n.language === 'en' ? 'primary' : 'outline-primary'} 
            onClick={() => changeLanguage('en')}
            style={{ fontSize: '0.7rem' }}
          >
            EN
          </Button>
        </ButtonGroup>
      </div>
      <div className="sidebar-content">
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

  if (location.pathname === '/login' && !isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
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
          <Button variant="link" className="text-dark p-0" onClick={() => setShowMobileMenu(true)}>
            <span className="navbar-toggler-icon" style={{ filter: 'invert(0)' }}></span>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
          </Button>
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
