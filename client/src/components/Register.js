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
      setSuccess('Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ maxWidth: '450px', width: '100%' }} className="shadow-lg border-0">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <img src="/menfop.png" alt="Logo" style={{ height: '60px' }} className="mb-3" />
            <h2 className="fw-bold">Créer un compte</h2>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Alpha"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ex: nom@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone (8 chiffres)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: 12345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={8}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 mb-3" disabled={loading}>
              {loading ? 'Création en cours...' : "S'inscrire"}
            </Button>
            
            <div className="text-center">
              <span className="text-muted">Déjà un compte ? </span>
              <Link to="/login" className="text-decoration-none">Se connecter</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;