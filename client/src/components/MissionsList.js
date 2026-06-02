import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button } from 'react-bootstrap';
import { missionsApi } from '../api'; // Use the new missionsApi
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const MissionsList = () => {
  const { t } = useTranslation();
  const [missions, setMissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await missionsApi.getMissions();
      setMissions(response.data.data);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError('Impossible de charger les missions.');
    }
  };

  const filteredMissions = [...missions]
    .sort((a, b) => b.id - a.id)
    .filter((mission) =>
      mission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mission.description && mission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mission.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status) => {
    switch (status) {
        case 'completed': return <Badge bg="success" className="bg-opacity-10 text-success rounded-pill px-3">Terminée</Badge>;
        case 'in_progress': return <Badge bg="warning" className="bg-opacity-10 text-dark rounded-pill px-3">En cours</Badge>;
        case 'pending': return <Badge bg="info" className="bg-opacity-10 text-info rounded-pill px-3">En attente</Badge>;
        default: return <Badge bg="secondary" className="bg-opacity-10 text-secondary rounded-pill px-3">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Liste des Missions</h1>
          <p className="text-muted mb-0">Historique complet des interventions et suivis de mission.</p>
        </div>
        <div className="d-flex gap-2 no-print align-items-center">
            <div className="position-relative" style={{ minWidth: '300px' }}>
                <InputGroup size="sm">
                    <InputGroup.Text className="bg-white border-end-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                        </svg>
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Rechercher une mission..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-start-0 ps-0 py-2"
                    />
                </InputGroup>
            </div>
            <Button variant="outline-primary" onClick={() => window.print()} className="py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer me-2" viewBox="0 0 16 16">
                    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
                </svg>
                {t('common.print') || 'Imprimer'}
            </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">ID</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Mission</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Description</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Statut</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Date</th>
                <th className="py-3 px-4 text-end text-muted small text-uppercase fw-bold no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMissions.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">Aucune mission trouvée.</td>
                </tr>
              ) : (
                filteredMissions.map((mission) => (
                  <tr key={mission.id}>
                    <td className="py-3 px-4 text-muted small">#{mission.id.toString().padStart(4, '0')}</td>
                    <td className="py-3 px-4 fw-bold">{mission.name}</td>
                    <td className="py-3 px-4 text-muted small" style={{ maxWidth: '250px' }}>
                        <div className="text-truncate">{mission.description || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                        {getStatusBadge(mission.status)}
                    </td>
                    <td className="py-3 px-4 text-muted small">
                        {new Date(mission.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-end no-print">
                      <Button as={Link} to={`/missions/${mission.id}`} variant="outline-primary" size="sm" className="fw-bold px-3">
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </Container>
  );
};

export default MissionsList;
