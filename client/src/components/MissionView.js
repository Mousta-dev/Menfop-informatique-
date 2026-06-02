import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button, Badge, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { missionsApi } from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const MissionView = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [error, setError] = useState('');

  const fetchMission = useCallback(async () => {
    try {
      const response = await missionsApi.getMission(id);
      setMission(response.data.data);
    } catch (err) {
      console.error('Error fetching mission:', err);
      setError(`Impossible de charger les détails de la mission.`);
      setMission(null);
    }
  }, [id]);

  useEffect(() => {
    fetchMission();
  }, [fetchMission]);

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/missions')}>Retour à la liste</Button>
      </Container>
    );
  }

  if (!mission) {
    return (
        <Container className="py-5 text-center text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p>Chargement des détails...</p>
        </Container>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
        case 'completed': return <Badge bg="success">TERMINÉE</Badge>;
        case 'in_progress': return <Badge bg="warning" text="dark">EN COURS</Badge>;
        case 'pending': return <Badge bg="info">EN ATTENTE</Badge>;
        default: return <Badge bg="secondary">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Détails de la Mission #{mission.id.toString().padStart(4, '0')}</h1>
          <p className="text-muted mb-0">Rapport d'intervention et suivi technique.</p>
        </div>
        <div className="d-flex gap-2 no-print">
          <Button variant="outline-primary" onClick={() => window.print()} className="fw-bold px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer me-2" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
            </svg>
            Imprimer
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/missions')} className="fw-bold">Retour</Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden mb-4">
        <Card.Header className="bg-primary text-white p-4 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold">{mission.name}</h4>
            {getStatusBadge(mission.status)}
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4">
            <Col xs={12} lg={4}>
                <div className="mb-4 p-3 bg-light rounded-4 border-0">
                    <label className="small fw-bold text-muted text-uppercase mb-1">Date de création</label>
                    <p className="fw-bold mb-0">{new Date(mission.created_at).toLocaleString()}</p>
                </div>
                <div>
                    <label className="small fw-bold text-muted text-uppercase mb-2 ms-1">Description / Objectif</label>
                    <div className="bg-light p-4 rounded-4 border-0 text-muted" style={{ whiteSpace: 'pre-wrap', minHeight: '150px', fontSize: '0.95rem' }}>
                        {mission.description || 'Aucune description fournie.'}
                    </div>
                </div>
            </Col>
            <Col xs={12} lg={8}>
                <label className="small fw-bold text-muted text-uppercase mb-3 ms-1">Interventions détaillées</label>
                {mission.interventions && mission.interventions.length > 0 ? (
                    <div className="border rounded-4 overflow-hidden">
                        <Table hover className="align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted">Matériel</th>
                                    <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted">Description</th>
                                    <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted">Résultat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mission.interventions.map((inter, idx) => (
                                    <tr key={idx}>
                                        <td className="py-3 px-4 border-bottom-0 fw-bold text-primary">{inter.equipment_name || `ID: ${inter.equipment_id}`}</td>
                                        <td className="py-3 px-4 border-bottom-0 text-muted">{inter.description}</td>
                                        <td className="py-3 px-4 border-bottom-0">
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">{inter.result}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                        <p className="text-muted mb-0">Aucune intervention enregistrée pour cette mission.</p>
                    </div>
                )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MissionView;
