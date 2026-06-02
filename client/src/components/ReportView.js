import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button, Container, Row, Col, InputGroup, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const ReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const response = await api.get(`/reports/${id}`);
      setReport(response.data.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Impossible de charger le rapport.');
      setReport(null);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
        <Container className="py-5 text-center">
            <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>
            <Button variant="primary" onClick={() => navigate('/reports')}>Retour à la liste</Button>
        </Container>
    );
  }

  if (!report) {
    return (
        <Container className="py-5 text-center text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p>Chargement du rapport...</p>
        </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Rapport #{report.id.toString().padStart(4, '0')}</h1>
          <p className="text-muted mb-0">Consultation du compte-rendu archivé.</p>
        </div>
        <div className="d-flex gap-2 no-print">
          <Button variant="outline-primary" onClick={() => window.print()} className="fw-bold px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer me-2" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
            </svg>
            Imprimer
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/reports')} className="fw-bold">Retour</Button>
        </div>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm overflow-hidden mb-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                <Card.Title className="fw-bold">Contenu du Rapport</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="bg-light p-4 rounded-4 border-0 mb-3" style={{ whiteSpace: 'pre-wrap', minHeight: '300px', fontSize: '1.1rem', lineHeight: '1.7' }}>
                {report.content}
              </div>
              <div className="text-end">
                <small className="text-muted fw-medium">Rédigé le {new Date(report.created_at).toLocaleString()}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4} className="no-print">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                    <Card.Title className="fw-bold">Partager</Card.Title>
                </Card.Header>
                <Card.Body className="p-4">
                    <p className="small text-muted mb-3">Utilisez ce lien pour partager ce rapport avec vos collaborateurs.</p>
                    <InputGroup className="mb-3">
                        <Form.Control
                            readOnly
                            value={window.location.href}
                            className="bg-light border-0 py-2 small"
                        />
                        <Button variant="primary" onClick={handleCopyShareUrl} className="fw-bold">
                            {copied ? 'Copié !' : 'Copier'}
                        </Button>
                    </InputGroup>
                </Card.Body>
            </Card>

            <div className="p-4 bg-primary bg-opacity-10 rounded-4 text-primary">
                <h6 className="fw-bold mb-2">Note technique</h6>
                <p className="small mb-0 opacity-75">Ce rapport est archivé de manière permanente et ne peut plus être modifié pour garantir l'intégrité des données.</p>
            </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportView;
