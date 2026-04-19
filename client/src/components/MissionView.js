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
      console.log('Fetching mission details for ID:', id);
      const response = await missionsApi.getMission(id);
      console.log('Mission response:', response.data);
      setMission(response.data.data);
    } catch (err) {
      console.error('Error fetching mission:', err);
      const serverError = err.response?.data?.error || err.response?.statusText || err.message;
      setError(`Impossible de charger les détails de la mission : ${serverError}`);
      setMission(null);
    }
  }, [id]);

  useEffect(() => {
    fetchMission();
  }, [fetchMission]);

  if (error) {
    return (
      <div className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/missions')}>Retour à la liste</Button>
      </div>
    );
  }

  if (!mission) {
    return <Alert variant="info" className="mt-4">Chargement des détails de la mission...</Alert>;
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Détails de la Mission #{mission.id}</h1>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={() => window.print()}>
            🖨️ {t('common.print') || 'Imprimer'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/missions')}>Retour à la liste</Button>
        </div>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{mission.name}</h4>
          <Badge bg={mission.status === 'completed' ? 'success' : 'warning'} className="p-2">
            {mission.status.toUpperCase()}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Card.Title className="text-muted mb-3">Description</Card.Title>
          <p className="border p-4 rounded bg-light" style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
            {mission.description || 'Aucune description fournie.'}
          </p>
          
          <h5 className="mt-4 mb-3">Interventions sur Matériel</h5>
          {mission.interventions && mission.interventions.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead className="bg-light">
                <tr>
                  <th>Matériel</th>
                  <th>Description</th>
                  <th>Résultat / État</th>
                </tr>
              </thead>
              <tbody>
                {mission.interventions.map((inter, idx) => (
                  <tr key={idx}>
                    <td><strong>{inter.equipment_name || `ID: ${inter.equipment_id}`}</strong></td>
                    <td>{inter.description}</td>
                    <td>{inter.result}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted italic">Aucune intervention enregistrée pour cette mission.</p>
          )}

          <hr />
          <div className="d-flex justify-content-between">
            <small className="text-muted">
              <strong>Créé le :</strong> {new Date(mission.created_at).toLocaleString()}
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MissionView;
