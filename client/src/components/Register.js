import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Card, Container } from 'react-bootstrap';
import api from '../api';
import './Login.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (phone && !/^\d{8}$/.test(phone)) {
        setError("Le numéro de téléphone doit comporter exactement 8 chiffres.");
        setLoading(false);
        return;
    }

    try {
      await api.post('/register', { 
        username, 
        email, 
        phone, 
        password 
      });
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="text-center mb-4">
            <img src="/menfop.png" alt="Logo" className="login-logo" />
            <h2 className="mb-1">Créer un compte</h2>
            <p className="login-subtitle">Rejoignez la plateforme Menfop-infos dès aujourd'hui.</p>
        </div>

        {error && <Alert variant="danger" className="py-2 small border-0 shadow-sm mb-4 text-center">{error}</Alert>}
        {success && <Alert variant="success" className="py-2 small border-0 shadow-sm mb-4 text-center">{success}</Alert>}

        <Form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                type="text"
                placeholder="Ex: Alpha"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Ex: nom@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Téléphone (8 chiffres)</label>
              <input
                type="text"
                placeholder="Ex: 12345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={8}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Création...
                </>
              ) : "S'inscrire gratuitement"}
            </button>
            
            <div className="login-footer">
              <span className="text-muted">Déjà un compte ? </span>
              <Link to="/login">Se connecter</Link>
            </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;