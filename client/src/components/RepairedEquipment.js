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
      setError(t('common.error_fetch_equipment') || 'Failed to fetch repaired equipment.');
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
      setError(t('common.error_fetch_establishments') || 'Failed to load establishments.');
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
    <div>
      <h1>{t('sidebar.repaired_equipment')}</h1>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{t('equipment.add_new')}</Card.Title>
          <Form onSubmit={handleAddRepairedEquipment}>
            <Form.Group className="mb-3">
              <Form.Label>{t('equipment.name')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('equipment.enter_name')}
                value={newEquipmentName}
                onChange={(e) => setNewEquipmentName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('sidebar.establishments')}</Form.Label>
              <Form.Select
                value={selectedEstablishment}
                onChange={(e) => setSelectedEstablishment(e.target.value)}
                disabled={establishments.length === 0}
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

            <Button variant="primary" type="submit" disabled={establishments.length === 0 || !newEquipmentName.trim()}>
              {t('common.add')}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t('sidebar.repaired_equipment')}</h2>
        <Form.Control
          type="text"
          placeholder={t('common.search')}
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredEquipment.length === 0 ? (
        <p>{t('equipment.no_found')}</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('common.name')}</th>
              <th>{t('sidebar.establishments')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.establishment_name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default RepairedEquipment;
