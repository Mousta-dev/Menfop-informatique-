import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import api from '../api';
import { Link } from 'react-router-dom';

const Rapport = () => {
  const [textInput, setTextInput] = useState('');
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveReport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setReportId(null);

    if (!textInput.trim()) {
      setError('Veuillez entrer du texte pour enregistrer un rapport.');
      return;
    }

    try {
      const response = await api.post('/reports', { content: textInput });
      setSuccess(`Rapport enregistré avec succès ! ID: ${response.data.data.id}`);
      setReportId(response.data.data.id);
      setTextInput('');
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Erreur lors de l’enregistrement du rapport.');
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Rédaction de Rapport</h1>
          <p className="text-muted mb-0">Rédigez et archivez vos comptes-rendus d'activités.</p>
        </div>
        <div className="d-flex gap-2">
            <Button as={Link} to="/reports" variant="outline-secondary" className="fw-bold">
                Tous les rapports
            </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" className="border-0 shadow-sm mb-4" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {reportId && (
        <Alert variant="info" className="border-0 shadow-sm mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <span>Rapport créé avec succès !</span>
            <Link to={`/reports/${reportId}`} className="btn btn-sm btn-info text-white fw-bold">Voir le rapport</Link>
          </div>
        </Alert>
      )}

      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <Card.Header className="border-0 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold">Nouveau Compte-rendu</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSaveReport}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Contenu du rapport</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={12}
                    placeholder="Commencez à rédiger votre rapport ici..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="py-3 border-0 bg-light rounded-4"
                    style={{ fontSize: '1.05rem', lineHeight: '1.6' }}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" size="lg" className="px-5 py-3 fw-bold rounded-pill">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-file-earmark-check-fill me-2" viewBox="0 0 16 16">
                          <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L11 .293A1 1 0 0 0 10.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m1.354 4.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
                        </svg>
                        Enregistrer le Rapport
                    </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Rapport;
