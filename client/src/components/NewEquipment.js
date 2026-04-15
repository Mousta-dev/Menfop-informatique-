import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';

const NewEquipment = () => {
  const { t } = useTranslation();
  const [equipmentName, setEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await api.get('/establishments');
      const data = response.data.data || [];
      setEstablishments(data);
      if (data.length > 0) {
        setSelectedEstablishment(String(data[0].id));
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError(t('common.error_fetch_establishments'));
    }
  };

  const filteredEstablishments = useMemo(() => {
    return establishments.filter((e) =>
      e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [establishments, searchTerm]);

  // Sync selectedEstablishment when filter changes
  useEffect(() => {
    if (filteredEstablishments.length > 0) {
      const currentExists = filteredEstablishments.some(e => String(e.id) === String(selectedEstablishment));
      if (!currentExists) {
        setSelectedEstablishment(String(filteredEstablishments[0].id));
      }
    } else if (searchTerm.trim() !== '' && filteredEstablishments.length === 0) {
        if (selectedEstablishment !== '') setSelectedEstablishment('');
    } else if (searchTerm.trim() === '' && establishments.length > 0 && selectedEstablishment === '') {
        setSelectedEstablishment(String(establishments[0].id));
    }
  }, [filteredEstablishments, selectedEstablishment, establishments, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!equipmentName.trim() || !selectedEstablishment) {
      setError(t('equipment.error_fill_all'));
      return;
    }

    try {
      await api.post('/equipment', {
        name: equipmentName,
        status: 'new',
        establishment_id: parseInt(selectedEstablishment),
      });
      setSuccess(t('equipment.success_add'));
      setEquipmentName('');
    } catch (err) {
      console.error('Error adding new equipment:', err);
      setError(t('equipment.error_add'));
    }
  };

  return (
    <div>
      <h1>{t('equipment.add_new')}</h1>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label><strong>{t('equipment.search_establishment')}</strong></Form.Label>
            <div className="d-flex gap-2">
                <Form.Control
                type="text"
                placeholder={t('equipment.filter_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                        {t('establishments.clear')}
                    </Button>
                )}
            </div>
          </Form.Group>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t('equipment.name')}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t('equipment.enter_name')}
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {searchTerm.trim() ? `${t('sidebar.establishments')} (${t('common.search')} "${searchTerm}")` : t('sidebar.establishments')}
          </Form.Label>
          <Form.Select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
          >
            {filteredEstablishments.length === 0 ? (
                <option value="">{t('establishments.no_found')}</option>
            ) : (
                filteredEstablishments.map((establishment) => (
                    <option key={establishment.id} value={String(establishment.id)}>
                        {establishment.name}
                    </option>
                ))
            )}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={!selectedEstablishment || !equipmentName.trim()}>
          {t('equipment.add_button')}
        </Button>
      </Form>
    </div>
  );
};

export default NewEquipment;
