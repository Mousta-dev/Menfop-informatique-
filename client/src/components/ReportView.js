import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useParams } from 'react-router-dom';

const ReportView = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const response = await api.get(`/reports/${id}`);
      setReport(response.data.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report.');
      setReport(null);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!report) {
    return <Alert variant="info">Chargement du rapport...</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Rapport #{report.id}</h1>
        <Button variant="outline-primary" onClick={() => window.print()}>
          🖨️ {t('common.print') || 'Imprimer'}
        </Button>
      </div>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Contenu du Rapport</Card.Title>
          <p className="border p-3 rounded" style={{ whiteSpace: 'pre-wrap', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            {report.content}
          </p>
          <Card.Text>
            <small className="text-muted">Créé le: {new Date(report.created_at).toLocaleString()}</small>
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="no-print">
        <Card.Body>
          <Card.Title>Partager ce Rapport</Card.Title>
          <Alert variant="secondary">
            {window.location.href}
          </Alert>
          <Button variant="outline-info" onClick={handleCopyShareUrl}>
            {copied ? 'Copié!' : 'Copier le lien de partage'}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportView;
