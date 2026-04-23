import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Login.css';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      const response = await axios.post('/api/login', { 
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
        setError(t('common.error_login_invalid'));
      }
    } catch (err) {
      setError(t('common.error_login_failed'));
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <img src="/menfop.png" alt="Logo" className="login-logo" />
        <h2>{t('common.login')}</h2>
        {error && <p className="error">{error}</p>}
        <div className="form-group">
          <label>{t('common.username')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>{t('common.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{t('common.login')}</button>
      </form>
    </div>
  );
};

export default Login;