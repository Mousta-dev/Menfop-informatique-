import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col, Table } from 'react-bootstrap';
import { missionsApi } from '../api';
import api from '../api';
import { Link } from 'react-router-dom';

const MissionForm = () => {
  const [missionName, setMissionName] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [missionStatus, setMissionStatus] = useState('pending');
  const [interventions, setInterventions] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  
  const [missionId, setMissionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipmentList(response.data.data);
    } catch (err) {
      console.error('Error fetching equipment:', err);
    }
  };

  const addIntervention = () => {
    setInterventions([...interventions, { equipment_id: '', description: '', result: '' }]);
  };

  const removeIntervention = (index) => {
    const newInterventions = [...interventions];
    newInterventions.splice(index, 1);
    setInterventions(newInterventions);
  };

  const updateIntervention = (index, field, value) => {
    const newInterventions = [...interventions];
    newInterventions[index][field] = value;
    setInterventions(newInterventions);
  };

  const handleSaveMission = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMissionId(null);

    if (!missionName.trim()) {
      setError('Please enter a mission name.');
      return;
    }

    try {
      const response = await missionsApi.createMission({
        name: missionName,
        description: missionDescription,
        status: missionStatus,
        interventions: interventions.filter(i => i.equipment_id !== '')
      });
      setSuccess(`Mission saved successfully! ID: ${response.data.data.id}`);
      setMissionId(response.data.data.id);
      setMissionName('');
      setMissionDescription('');
      setMissionStatus('pending');
      setInterventions([]);
    } catch (err) {
      console.error('Error saving mission:', err);
      setError('Failed to save mission.');
    }
  };

  return (
    <div className="pb-5">
      <h1>Nouvelle Mission</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {missionId && (
        <Alert variant="info">
          Voir la mission : <Link to={`/missions/${missionId}`}>Mission #{missionId}</Link> ou <Link to="/missions">Toutes les missions</Link>
        </Alert>
      )}

      <Form onSubmit={handleSaveMission}>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Informations Générales</Card.Title>
            <Form.Group className="mb-3">
              <Form.Label>Nom de la mission:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Maintenance préventive Lycée d'État"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description / Objectif:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Détails de la mission..."
                value={missionDescription}
                onChange={(e) => setMissionDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut Initial:</Form.Label>
              <Form.Control
                as="select"
                value={missionStatus}
                onChange={(e) => setMissionStatus(e.target.value)}
              >
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
              </Form.Control>
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0">Interventions sur Matériel</Card.Title>
              <Button variant="outline-success" size="sm" onClick={addIntervention}>
                + Ajouter une intervention
              </Button>
            </div>

            {interventions.length === 0 ? (
              <div className="text-center text-muted py-3 border rounded bg-light">
                Aucune intervention ajoutée. Cliquez sur le bouton ci-dessus pour en ajouter une.
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover size="sm" className="align-middle">
                  <thead className="bg-light text-muted small">
                    <tr>
                      <th style={{ width: '30%' }}>Matériel</th>
                      <th style={{ width: '35%' }}>Description de l'intervention</th>
                      <th style={{ width: '25%' }}>Résultat / État final</th>
                      <th style={{ width: '10%' }} className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interventions.map((inter, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={inter.equipment_id}
                            onChange={(e) => updateIntervention(index, 'equipment_id', e.target.value)}
                            required
                          >
                            <option value="">Sélectionner...</option>
                            {equipmentList.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(eq => (
                              <option key={eq.id} value={eq.id}>
                                {eq.name} ({eq.establishment_name})
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            placeholder="Ex: Réparation écran"
                            value={inter.description}
                            onChange={(e) => updateIntervention(index, 'description', e.target.value)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            placeholder="Ex: Fonctionnel"
                            value={inter.result}
                            onChange={(e) => updateIntervention(index, 'result', e.target.value)}
                          />
                        </td>
                        <td className="text-center">
                          <Button variant="outline-danger" size="sm" onClick={() => removeIntervention(index)}>
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="d-grid">
          <Button variant="primary" type="submit" size="lg">
            Enregistrer la Mission et les Interventions
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default MissionForm;
