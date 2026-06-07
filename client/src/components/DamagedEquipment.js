import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Form, Button, Card, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';

const DamagedEquipment = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');

  const fetchDamagedEquipment = useCallback(async () => {
    try {
      const response = await api.get('/equipment/damaged');
      setEquipment(response.data.data);
    } catch (err) {
      console.error('Error fetching damaged equipment:', err);
      setError('Failed to fetch damaged equipment.');
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
      setError('Failed to load establishments.');
    }
  }, []);

  useEffect(() => {
    fetchDamagedEquipment();
    fetchEstablishments();
  }, [fetchDamagedEquipment, fetchEstablishments]);

  const filteredEquipment = [...equipment]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDamagedEquipment = async (e) => {
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
        status: 'damaged',
        establishment_id: selectedEstablishment,
      });
      setSuccess('Matériel endommagé ajouté avec succès !');
      setNewEquipmentName('');
      fetchDamagedEquipment();
    } catch (err) {
      console.error('Error adding damaged equipment:', err);
      setError('Erreur lors de l’ajout.');
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t('sidebar.damaged_equipment')}</h1>
          <p className="text-muted mb-0">Suivez le matériel nécessitant une intervention technique.</p>
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
            <Card.Header className="border-0 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold text-danger">Signaler un Dommage</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleAddDamagedEquipment}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Nom du Matériel</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Écran Dell"
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
                    <Button variant="danger" type="submit" disabled={establishments.length === 0} className="py-2 fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                        </svg>
                        Signaler
                    </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold mb-0">Liste du Matériel Endommagé</Card.Title>
              <div className="no-print" style={{ minWidth: '280px' }}>
                <InputGroup size="sm">
                  <InputGroup.Text className="border-end-0">
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
                  <thead>
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
                          Aucun matériel endommagé trouvé.
                        </td>
                      </tr>
                    ) : (
                      filteredEquipment.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 text-muted small">#{item.id.toString().padStart(4, '0')}</td>
                          <td className="py-3 px-4 fw-bold">{item.name}</td>
                          <td className="py-3 px-4">
                            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill">
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

export default DamagedEquipment;
