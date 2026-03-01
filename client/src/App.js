import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
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
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <>
      {location.pathname !== '/login' && (
        <Navbar expand="lg" className="navbar">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <img
                src="/menfop.png"
                width="30"
                height="30"
                className="d-inline-block align-top me-2"
                alt="Menfop Logo"
              />
              Menfop-infos
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              {isAuthenticated && (
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/establishments">Etablissements</Nav.Link>
                  <Nav.Link as={Link} to="/manage-equipment">Gérer Equipement</Nav.Link>
                  <Nav.Link as={Link} to="/new-equipment">Nouveau Materiel</Nav.Link>
                  <Nav.Link as={Link} to="/damaged-equipment">Materiel Endommagé</Nav.Link>
                  <Nav.Link as={Link} to="/functional-equipment">Materiel Fonctionnel</Nav.Link>
                  <Nav.Link as={Link} to="/new-mission">Nouvelle Mission</Nav.Link>
                  <Nav.Link as={Link} to="/missions">Voir Missions</Nav.Link>
                  <Nav.Link as={Link} to="/rapport">Rapport</Nav.Link>
                  <Nav.Link as={Link} to="/reports">Voir Rapports</Nav.Link>
                  {userRole === 'administrateur' && (
                    <Nav.Link as={Link} to="/users" className="fw-bold text-warning">Gestion Utilisateurs</Nav.Link>
                  )}
                </Nav>
              )}

              <Nav>
                {isAuthenticated ? (
                  <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                ) : (
                  null
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      <Container className="mt-3">
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
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
        </Routes>
      </Container>
    </>
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