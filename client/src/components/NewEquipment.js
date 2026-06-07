import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Alert, Card, Container, Row, Col, InputGroup } from 'react-bootstrap';
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
    return [...establishments]
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .filter((e) =>
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
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t('equipment.add_new')}</h1>
          <p className="text-muted mb-0">Enregistrez le matériel nouvellement acquis pour chaque établissement.</p>
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
      
      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" className="border-0 shadow-sm mb-4" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row className="g-4">
        <Col xs={12} lg={5} className="no-print">
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="border-0 pt-4 px-4 pb-0">
                    <Card.Title className="fw-bold">Ajouter un équipement</Card.Title>
                </Card.Header>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Rechercher l'établissement</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="border-end-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                                    </svg>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder={t('equipment.filter_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-start-0 ps-0 py-2"
                                />
                                {searchTerm && (
                                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                                        ×
                                    </Button>
                                )}
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Nom du Matériel</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={t('equipment.enter_name')}
                                value={equipmentName}
                                onChange={(e) => setEquipmentName(e.target.value)}
                                className="py-2"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Sélectionner l'établissement</Form.Label>
                            <Form.Select
                                value={selectedEstablishment}
                                onChange={(e) => setSelectedEstablishment(e.target.value)}
                                className="py-2"
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

                        <div className="d-grid">
                            <Button variant="primary" type="submit" disabled={!selectedEstablishment || !equipmentName.trim()} className="py-2 fw-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                                </svg>
                                {t('equipment.add_button')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Col>
        
        <Col xs={12} lg={7}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="border-0 pt-4 px-4 pb-2">
                    <Card.Title className="fw-bold">Aide à l'enregistrement</Card.Title>
                </Card.Header>
                <Card.Body className="p-4">
                    <div className="bg-primary bg-opacity-10 p-4 rounded-4 mb-4">
                        <h5 className="text-primary fw-bold mb-3">Informations Importantes</h5>
                        <ul className="mb-0 text-muted">
                            <li className="mb-2">Utilisez le champ de recherche pour filtrer rapidement les établissements.</li>
                            <li className="mb-2">Le matériel ajouté ici aura automatiquement le statut <strong>"Nouveau"</strong>.</li>
                            <li className="mb-2">Vous pourrez modifier ou supprimer cet équipement dans la section <strong>"Gérer le Matériel"</strong>.</li>
                        </ul>
                    </div>
                    <div className="text-center py-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-box-seam text-primary opacity-25" viewBox="0 0 16 16">
                            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 6.133 13.753 3.85zm6.512 8.282-3.69-1.476-3.69 1.476L8 8.133l-3.69 1.476-3.69-1.476L8 1.133z"/>
                        </svg>
                    </div>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewEquipment;
