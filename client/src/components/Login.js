import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-bootstrap';
import api from '../api';
import './Login.css';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      const response = await api.post('/login', { 
        username: trimmedUsername, 
        password: trimmedPassword 
      });

      if (response.data.success) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('role', response.data.role);
        sessionStorage.setItem('username', response.data.username);
        setIsAuthenticated(true);
        setUserRole(response.data.role);
        navigate('/');
      } else {
        setError(response.data.message || t('common.error_login_invalid'));
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data?.error || err.response.data?.message || t('common.error_login_failed'));
      } else if (err.request) {
        setError("Le serveur ne répond pas. Veuillez vérifier que le backend est lancé sur le port 3001.");
      } else {
        setError(t('common.error_login_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src="/menfop.png" alt="Logo" className="login-logo" />
        <h2>{t('common.login')}</h2>
        <p className="login-subtitle">Connectez-vous pour accéder à votre espace de gestion.</p>
        
        {error && <Alert variant="danger" className="py-2 small border-0 shadow-sm mb-4 text-center">{error}</Alert>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{t('common.identifier') || 'Email ou Téléphone'}</label>
            <input
              type="text"
              placeholder={t('common.identifier_placeholder') || 'Ex: admin@menfop.com'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('common.password')}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {t('common.loading')}
              </>
            ) : t('common.login')}
          </button>
        </form>
        
        <div className="login-footer">
          <span className="text-muted">Pas encore de compte ? </span>
          <Link to="/register">S'inscrire gratuitement</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;