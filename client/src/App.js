import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import { Container, Button, Offcanvas, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Home from './components/Home';
import Establishments from './components/Establishments';
import NewEquipment from './components/NewEquipment';
import DamagedEquipment from './components/DamagedEquipment';
import FunctionalEquipment from './components/FunctionalEquipment';
import RepairedEquipment from './components/RepairedEquipment';
import ManageEquipment from './components/ManageEquipment';
import Rapport from './components/Rapport';
import ReportsList from './components/ReportsList';
import ReportView from './components/ReportView';
import MissionForm from './components/MissionForm';
import MissionsList from './components/MissionsList';
import MissionView from './components/MissionView';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import Register from './components/Register';
import MessageBox from './components/MessageBox';
import MessagesPage from './components/MessagesPage';
import './App.css';
import axios from 'axios';

const AppContent = () => {
  const { t, i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));
  const [userRole, setUserRole] = useState(sessionStorage.getItem('role'));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();

  useEffect(()=>{},[]);

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
    <Button className="theme-toggle-btn w-100 mb-2" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-moon-stars-fill" viewBox="0 0 16 16">
          <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
          <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-brightness-high-fill" viewBox="0 0 16 16">
          <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
        </svg>
      )}
      <span className="ms-2">{theme === 'light' ? t('sidebar.dark_mode') : t('sidebar.light_mode')}</span>
    </Button>
  );

  const LangSwitcher = () => (
    <ButtonGroup className="w-100 mb-3 overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
      <Button 
        variant={i18n.language === 'fr' ? 'primary' : 'outline-primary'} 
        className="py-1 text-xs"
        style={{ fontSize: '0.75rem' }}
        onClick={() => i18n.changeLanguage('fr')}
      >
        Français
      </Button>
      <Button 
        variant={i18n.language === 'en' ? 'primary' : 'outline-primary'} 
        className="py-1 text-xs"
        style={{ fontSize: '0.75rem' }}
        onClick={() => i18n.changeLanguage('en')}
      >
        English
      </Button>
    </ButtonGroup>
  );

  const SidebarContent = () => {
    const username = sessionStorage.getItem('username');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      const fetchUnread = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        try {
          const res = await axios.get('/api/notifications', { headers: { Authorization: 'Bearer ' + token } });
          if (res.data && res.data.data) {
            const unread = res.data.data.filter(n => !n.read).length;
            setUnreadCount(unread);
          }
        } catch (e) { /* ignore */ }
      };
      fetchUnread();
    }, []);

    return (
      <>
        <div className="sidebar-header">
          <Link to="/" className="text-decoration-none d-flex align-items-center mb-1" onClick={() => setShowMobileMenu(false)}>
            <img src="/menfop.png" alt="Logo" className="sidebar-logo" />
            <span className="navbar-brand mb-0 h1">Menfop-infos</span>
          </Link>
          
          {isAuthenticated && (
            <div className="user-profile-badge mt-2">
              <div className="user-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>
              </div>
              <div className="user-info">
                <span className="user-name text-truncate" title={username}>{username}</span>
                <span className="user-role-label">{userRole}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="sidebar-content">
          <ThemeToggle />
          <LangSwitcher />
          
          {/* Section 3: Navigation */}
          <div className="sidebar-section-label px-3 pt-2 pb-1 text-uppercase small fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            {t('sidebar.menu') || 'Navigation'}
          </div>
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-speedometer2 me-2" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
              <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25a3.37 3.37 0 0 0-3.055.51 1.14 1.14 0 0 1-1.12 0 3.37 3.37 0 0 0-3.055-.51C4.3 14.263 2.897 13.914 2.455 12.661A8 8 0 0 1 0 10m8-7a7 7 0 1 0 5.135 11.865.67.67 0 0 1 .44-.278c.131-.02.238.056.324.139a6.7 6.7 0 1 1-11.799 0c.086-.083.193-.159.324-.139a.67.67 0 0 1 .44.278A7 7 0 0 0 8 3"/>
            </svg>
            {t('sidebar.dashboard')}
          </NavLink>

          <NavLink to="/establishments" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-building me-2" viewBox="0 0 16 16">
              <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 8.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 11.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
              <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z"/>
            </svg>
            {t('sidebar.establishments')}
          </NavLink>
          <NavLink to="/manage-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-tools me-2" viewBox="0 0 16 16">
              <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.271 3.271a.5.5 0 0 0 .707 0l1.507-1.507a.5.5 0 0 0 0-.707l-3.271-3.271a1 1 0 0 0-1.023-.242l-.914.305-.968-.968 2.617-2.654A3.003 3.003 0 0 0 16 3a3 3 0 1 0-5.878.851l-2.654 2.617-.968-.968.305-.914a1 1 0 0 0-.242-1.023L3.293 1.159a2.22 2.22 0 0 0-1.255-.74L1 0zm5.439 7.961 2.599-2.599.45.45-2.599 2.599-.45-.45z"/>
            </svg>
            {t('sidebar.manage_equipment')}
          </NavLink>

          {/* Section 1: Equipment Status */}
          <div className="sidebar-section-label px-3 pt-3 pb-1 text-uppercase small fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            {t('sidebar.equipment_status') || 'États du Matériel'}
          </div>
          <NavLink to="/new-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-square me-2" viewBox="0 0 16 16">
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
            </svg>
            {t('sidebar.new_equipment')}
          </NavLink>
          <NavLink to="/damaged-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-octagon me-2" viewBox="0 0 16 16">
              <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
            </svg>
            {t('sidebar.damaged_equipment')}
          </NavLink>
          <NavLink to="/functional-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle me-2" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            {t('sidebar.functional_equipment')}
          </NavLink>
          <NavLink to="/repaired-equipment" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-wrench-adjustable me-2" viewBox="0 0 16 16">
              <path d="M16 4.5a4.5 4.5 0 0 1-1.703 3.526L13 10l2.677 2.677a2.5 2.5 0 1 1-3.536 3.536L9.5 13.5l-2.026 2.027a4.5 4.5 0 1 1-6.364-6.364l2.027-2.026L1.5 5.5a2.5 2.5 0 1 1 3.536-3.536L7.707 4.64a4.5 4.5 0 0 1 8.293 4.36zM15 4.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0M4.146 12.354a.5.5 0 1 0-.708-.708.5.5 0 0 0 .708.708"/>
            </svg>
            {t('sidebar.repaired_equipment')}
          </NavLink>

          {/* Section 2: Missions & Reports */}
          <div className="sidebar-section-label px-3 pt-3 pb-1 text-uppercase small fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            {t('sidebar.missions_reports') || 'Missions & Rapports'}
          </div>
          <NavLink to="/new-mission" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle me-2" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
            </svg>
            {t('sidebar.new_mission')}
          </NavLink>
          <NavLink to="/missions" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-card-list me-2" viewBox="0 0 16 16">
              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
              <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
            </svg>
            {t('sidebar.view_missions')}
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
              <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
              <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
            </svg>
            {t('sidebar.view_reports')}
          </NavLink>

          {userRole === 'administrateur' && (
            <>
              <div className="sidebar-section-label px-3 pt-3 pb-1 text-uppercase small fw-bold text-danger" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                Admin
              </div>
              <NavLink to="/users" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} text-danger`} onClick={() => setShowMobileMenu(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people-fill me-2" viewBox="0 0 16 16">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                </svg>
                {t('sidebar.user_management')}
              </NavLink>
            </>
          )}
        </div>
        
        <div className="sidebar-footer">
          <div style={{ marginBottom: '10px' }}>
            <Button as={Link} to="/messages" variant={location.pathname === '/messages' ? 'primary' : 'outline-primary'} className="w-100 rounded-pill btn-sm mb-2" onClick={() => setShowMobileMenu(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-chat-dots me-2" viewBox="0 0 16 16">
                <path d="M2 1a1 1 0 0 0-1 1v8.5A1.5 1.5 0 0 0 2.5 12H4v1.5a.5.5 0 0 0 .854.354L7.707 10H13a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/>
                <path d="M3 5.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0zm2 0a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0zm2 0a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0z"/>
              </svg>
              Messagerie
            </Button>
          </div>

          <Button variant="outline-danger" className="w-100 rounded-pill btn-sm" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-box-arrow-right me-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
            </svg>
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

  if (['/login', '/register'].includes(location.pathname) && !isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-lang-switcher">
          <ThemeToggle />
        </div>
        <div className="flex-grow-1">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
            <Route path="/register" element={<Register />} />
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
             <Button variant="link" className="p-0 me-3" onClick={toggleTheme} style={{ color: 'var(--text-main)' }}>
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
            <Button variant="link" className="p-0" onClick={() => setShowMobileMenu(true)} style={{ color: 'var(--text-main)' }}>
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
              <Route path="/repaired-equipment" element={<PrivateRoute><RepairedEquipment /></PrivateRoute>} />
              <Route path="/manage-equipment" element={<PrivateRoute><ManageEquipment userRole={userRole} /></PrivateRoute>} />
              <Route path="/rapport" element={<PrivateRoute><Rapport /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><ReportsList /></PrivateRoute>} />
              <Route path="/reports/:id" element={<PrivateRoute><ReportView /></PrivateRoute>} />
              <Route path="/new-mission" element={<PrivateRoute><MissionForm /></PrivateRoute>} />
              <Route path="/missions" element={<PrivateRoute><MissionsList /></PrivateRoute>} />
              <Route path="/missions/:id" element={<PrivateRoute><MissionView /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute>{userRole === 'administrateur' ? <UserManagement /> : <Navigate to="/" />}</PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
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




