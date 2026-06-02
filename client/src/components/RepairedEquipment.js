import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Form, Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';

const RepairedEquipment = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');

  const fetchRepairedEquipment = useCallback(async () => {
    try {
      const response = await api.get('/equipment/repaired');
      setEquipment(response.data.data);
    } catch (err) {
      console.error('Error fetching repaired equipment:', err);
      setError(t('common.error_fetch_equipment') || 'Impossible de charger le matériel réparé.');
    }
  }, [t]);

  const fetchEstablishments = useCallback(async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedEstablishment(response.data.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError(t('common.error_fetch_establishments') || 'Erreur chargement établissements.');
    }
  }, [t]);

  useEffect(() => {
    fetchRepairedEquipment();
    fetchEstablishments();
  }, [fetchRepairedEquipment, fetchEstablishments]);

  const filteredEquipment = [...equipment]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((item) =>
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.establishment_name && item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddRepairedEquipment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEquipmentName.trim() || !selectedEstablishment) {
      setError(t('equipment.error_fill_all'));
      return;
    }

    try {
      await api.post('/equipment', {
        name: newEquipmentName,
        status: 'repaired',
        establishment_id: selectedEstablishment,
      });
      setSuccess(t('equipment.success_add'));
      setNewEquipmentName('');
      fetchRepairedEquipment();
    } catch (err) {
      console.error('Error adding repaired equipment:', err);
      setError(t('equipment.error_add'));
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t('sidebar.repaired_equipment')}</h1>
          <p className="text-muted mb-0">Matériel ayant été remis en service après maintenance.</p>
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
              <Card.Title className="fw-bold text-warning">{t('equipment.add_new')}</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleAddRepairedEquipment}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">{t('equipment.name')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('equipment.enter_name')}
                    value={newEquipmentName}
                    onChange={(e) => setNewEquipmentName(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">{t('sidebar.establishments')}</Form.Label>
                  <Form.Select
                    value={selectedEstablishment}
                    onChange={(e) => setSelectedEstablishment(e.target.value)}
                    disabled={establishments.length === 0}
                    className="py-2"
                  >
                    {establishments.length === 0 ? (
                      <option>{t('common.loading')}</option>
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
                    <Button variant="warning" type="submit" disabled={establishments.length === 0 || !newEquipmentName.trim()} className="py-2 fw-bold text-dark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-tools me-2" viewBox="0 0 16 16">
                          <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.271 3.271a.5.5 0 0 0 .707 0l1.507-1.507a.5.5 0 0 0 0-.707l-3.271-3.271a1 1 0 0 0-1.023-.242l-.914.305-.968-.968 2.617-2.654A3.003 3.003 0 0 0 16 3a3 3 0 1 0-5.878.851l-2.654 2.617-.968-.968.305-.914a1 1 0 0 0-.242-1.023L3.293 1.159a2.22 2.22 0 0 0-1.255-.74L1 0zm5.439 7.961 2.599-2.599.45.45-2.599 2.599-.45-.45z"/>
                        </svg>
                        {t('common.add')}
                    </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold mb-0">Historique des Réparations</Card.Title>
              <div className="no-print" style={{ minWidth: '280px' }}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white border-end-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 ps-0 py-2"
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
                      <th className="py-3 px-4">{t('common.name')}</th>
                      <th className="py-3 px-4">{t('sidebar.establishments')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          {t('equipment.no_found')}
                        </td>
                      </tr>
                    ) : (
                      filteredEquipment.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 text-muted small">#{item.id.toString().padStart(4, '0')}</td>
                          <td className="py-3 px-4 fw-bold">{item.name}</td>
                          <td className="py-3 px-4">
                            <span className="badge bg-warning bg-opacity-10 text-dark px-3 py-2 rounded-pill">
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

export default RepairedEquipment;
