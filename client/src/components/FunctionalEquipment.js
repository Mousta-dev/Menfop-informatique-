import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Form, Button, Card, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';

const FunctionalEquipment = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');

  const fetchFunctionalEquipment = useCallback(async () => {
    try {
      const response = await api.get('/equipment/functional');
      setEquipment(response.data.data);
    } catch (err) {
      console.error('Error fetching functional equipment:', err);
      setError('Impossible de charger le matériel fonctionnel.');
    }
  }, []);

  const fetchEstablishments = useCallback(async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedEstablishment(response.data.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Erreur lors du chargement des établissements.');
    }
  }, []);

  useEffect(() => {
    fetchFunctionalEquipment();
    fetchEstablishments();
  }, [fetchFunctionalEquipment, fetchEstablishments]);

  const filteredEquipment = [...equipment]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFunctionalEquipment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEquipmentName.trim() || !selectedEstablishment) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      await api.post('/equipment', {
        name: newEquipmentName,
        status: 'functional',
        establishment_id: selectedEstablishment,
      });
      setSuccess('Matériel fonctionnel ajouté avec succès !');
      setNewEquipmentName('');
      fetchFunctionalEquipment();
    } catch (err) {
      console.error('Error adding functional equipment:', err);
      setError('Erreur lors de l’ajout.');
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t('sidebar.functional_equipment')}</h1>
          <p className="text-muted mb-0">Liste complète du matériel opérationnel par établissement.</p>
        </div>
        <div className="d-flex gap-2 no-print">
          <Button variant="outline-primary" onClick={() => window.print()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer me-2" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
            </svg>
            {t('common.print') || 'Imprimer'}
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" className="border-0 shadow-sm mb-4" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="g-4 mb-4">
        <Col xs={12} lg={4} className="no-print">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold text-success">Ajout Manuel (Fonctionnel)</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleAddFunctionalEquipment}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Nom du Matériel</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Souris Optique"
                    value={newEquipmentName}
                    onChange={(e) => setNewEquipmentName(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Établissement</Form.Label>
                  <Form.Select
                    value={selectedEstablishment}
                    onChange={(e) => setSelectedEstablishment(e.target.value)}
                    disabled={establishments.length === 0}
                    className="py-2"
                  >
                    {establishments.length === 0 ? (
                      <option>Chargement...</option>
                    ) : (
                      [...establishments].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((establishment) => (
                        <option key={establishment.id} value={establishment.id}>
                          {establishment.name}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>

                <div className="d-grid">
                    <Button variant="success" type="submit" disabled={establishments.length === 0} className="py-2 fw-bold text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                        Ajouter
                    </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold mb-0">Inventaire Opérationnel</Card.Title>
              <div className="no-print" style={{ minWidth: '280px' }}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white border-end-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                </InputGroup>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Nom</th>
                      <th className="py-3 px-4">Établissement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          Aucun matériel fonctionnel trouvé.
                        </td>
                      </tr>
                    ) : (
                      filteredEquipment.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 text-muted small">#{item.id.toString().padStart(4, '0')}</td>
                          <td className="py-3 px-4 fw-bold">{item.name}</td>
                          <td className="py-3 px-4">
                            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                              {item.establishment_name}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FunctionalEquipment;
