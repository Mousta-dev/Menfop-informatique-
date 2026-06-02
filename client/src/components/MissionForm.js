import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Table } from 'react-bootstrap';
import { missionsApi } from '../api';
import { Link } from 'react-router-dom';

import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Table, Container, InputGroup } from 'react-bootstrap';
import { missionsApi } from '../api';
import { Link } from 'react-router-dom';

const MissionForm = () => {
  const [missionName, setMissionName] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [missionStatus, setMissionStatus] = useState('pending');
  const [interventions, setInterventions] = useState([]);
  
  const [missionId, setMissionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addIntervention = () => {
    setInterventions([...interventions, { equipment_name: '', description: '', result: '' }]);
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
      setError('Veuillez entrer un nom de mission.');
      return;
    }

    try {
      const response = await missionsApi.createMission({
        name: missionName,
        description: missionDescription,
        status: missionStatus,
        interventions: interventions.filter(i => i.equipment_name !== '')
      });
      setSuccess(`Mission enregistrée avec succès ! ID: ${response.data.data.id}`);
      setMissionId(response.data.data.id);
      setMissionName('');
      setMissionDescription('');
      setMissionStatus('pending');
      setInterventions([]);
    } catch (err) {
      console.error('Error saving mission:', err);
      setError('Erreur lors de l’enregistrement de la mission.');
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Nouvelle Mission</h1>
          <p className="text-muted mb-0">Planifiez une nouvelle intervention technique ou administrative.</p>
        </div>
        <div className="d-flex gap-2">
            <Button as={Link} to="/missions" variant="outline-secondary" className="fw-bold">
                Toutes les missions
            </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" className="border-0 shadow-sm mb-4" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {missionId && (
        <Alert variant="info" className="border-0 shadow-sm mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <span>Mission créée !</span>
            <Link to={`/missions/${missionId}`} className="btn btn-sm btn-info text-white fw-bold">Voir la mission</Link>
          </div>
        </Alert>
      )}

      <Form onSubmit={handleSaveMission}>
        <Row className="g-4">
          <Col xs={12} lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                <Card.Title className="fw-bold">Informations Générales</Card.Title>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Nom de la mission</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Maintenance Lycée X"
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    required
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Statut Initial</Form.Label>
                  <Form.Select
                    value={missionStatus}
                    onChange={(e) => setMissionStatus(e.target.value)}
                    className="py-2"
                  >
                    <option value="pending">En attente</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminée</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-0">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Détails de l'objectif..."
                    value={missionDescription}
                    onChange={(e) => setMissionDescription(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center pt-4 px-4 pb-0">
                <Card.Title className="fw-bold mb-0">Interventions sur Matériel</Card.Title>
                <Button variant="success" size="sm" onClick={addIntervention} className="fw-bold text-white px-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-plus-circle me-1" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                  </svg>
                  Ajouter
                </Button>
              </Card.Header>
              <Card.Body className="p-4">
                {interventions.length === 0 ? (
                  <div className="text-center text-muted py-5 border border-dashed rounded-4 bg-light bg-opacity-50">
                    <div className="mb-3 opacity-25">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-tools" viewBox="0 0 16 16">
                            <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.271 3.271a.5.5 0 0 0 .707 0l1.507-1.507a.5.5 0 0 0 0-.707l-3.271-3.271a1 1 0 0 0-1.023-.242l-.914.305-.968-.968 2.617-2.654A3.003 3.003 0 0 0 16 3a3 3 0 1 0-5.878.851l-2.654 2.617-.968-.968.305-.914a1 1 0 0 0-.242-1.023L3.293 1.159a2.22 2.22 0 0 0-1.255-.74L1 0zm5.439 7.961 2.599-2.599.45.45-2.599 2.599-.45-.45z"/>
                        </svg>
                    </div>
                    <p className="mb-0 fw-medium">Aucune intervention ajoutée.</p>
                    <small>Cliquez sur "Ajouter" pour lister le matériel traité.</small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="py-3 small text-uppercase fw-bold text-muted">Matériel</th>
                          <th className="py-3 small text-uppercase fw-bold text-muted">Description</th>
                          <th className="py-3 small text-uppercase fw-bold text-muted">Résultat</th>
                          <th className="py-3 text-center small text-uppercase fw-bold text-muted">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interventions.map((inter, index) => (
                          <tr key={index}>
                            <td>
                              <Form.Control
                                type="text"
                                placeholder="Nom"
                                value={inter.equipment_name}
                                onChange={(e) => updateIntervention(index, 'equipment_name', e.target.value)}
                                required
                                className="py-1"
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                placeholder="Ex: Réparation écran"
                                value={inter.description}
                                onChange={(e) => updateIntervention(index, 'description', e.target.value)}
                                className="py-1"
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                placeholder="Ex: OK"
                                value={inter.result}
                                onChange={(e) => updateIntervention(index, 'result', e.target.value)}
                                className="py-1"
                              />
                            </td>
                            <td className="text-center">
                              <Button variant="outline-danger" size="sm" onClick={() => removeIntervention(index)} className="border-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                </svg>
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
          </Col>
        </Row>

        <div className="mt-4 text-end">
          <Button variant="primary" type="submit" size="lg" className="px-5 py-3 fw-bold rounded-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-send-check-fill me-2" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855a.75.75 0 0 0-.124 1.329l4.995 3.178 1.531 2.406a.5.5 0 0 0 .844-.536L6.637 10.07l7.494-7.494-1.895 4.738a.5.5 0 1 0 .928.372zm-2.09 4.79L1.53 12.355a.5.5 0 0 1-.604.644l-2.451-.613a.5.5 0 0 1-.316-.76l4-4a.5.5 0 0 1 .708 0l2.451 2.451a.5.5 0 0 1 0 .708z"/>
              <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"/>
            </svg>
            Enregistrer la Mission
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default MissionForm;
