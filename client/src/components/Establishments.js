import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal, Container, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';

const Establishments = ({ userRole }) => {
  const { t } = useTranslation();
  const [establishments, setEstablishments] = useState([]);
  const [newEstablishmentName, setNewEstablishmentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEstablishment, setCurrentEstablishment] = useState(null);
  const [editedEstablishmentName, setEditedEstablishmentName] = useState('');

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError(t('common.error_fetch_establishments'));
    }
  };

  const filteredEstablishments = [...establishments]
    .sort((a, b) => a.id - b.id)
    .filter((e) =>
      e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

  const handleAddEstablishment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEstablishmentName.trim()) {
      setError(t('establishments.error_empty'));
      return;
    }
    try {
      await api.post('/establishments', { name: newEstablishmentName });
      setSuccess(t('establishments.success_add'));
      setNewEstablishmentName('');
      fetchEstablishments();
    } catch (err) {
      console.error('Error adding establishment:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      setError(`${t('establishments.error_add')} : ${serverError || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (window.confirm(t('establishments.delete_confirm'))) {
      try {
        await api.delete(`/establishments/${id}`);
        setSuccess(t('establishments.success_delete'));
        fetchEstablishments();
      } catch (err) {
        console.error('Error deleting establishment:', err);
        const serverError = err.response?.data?.error || err.response?.data?.message;
        setError(`${t('establishments.error_delete')} : ${serverError || err.message}`);
      }
    }
  };

  const handleEdit = (establishment) => {
    setCurrentEstablishment(establishment);
    setEditedEstablishmentName(establishment.name);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentEstablishment(null);
    setEditedEstablishmentName('');
    setError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editedEstablishmentName.trim()) {
      setError(t('establishments.error_empty'));
      return;
    }

    try {
      const url = `/establishments/${currentEstablishment.id}`;
      await api.put(url, { name: editedEstablishmentName });
      setSuccess(t('establishments.success_update'));
      handleCloseEditModal();
      fetchEstablishments();
    } catch (err) {
      console.error('Error updating establishment:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      setError(`${t('establishments.error_update')} : ${serverError || err.message}`);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t('establishments.title')}</h1>
          <p className="text-muted mb-0">Gérez les différents établissements scolaires et administratifs.</p>
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
              <Card.Title className="fw-bold">{t('establishments.add_new')}</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleAddEstablishment}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">{t('establishments.name_label')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('establishments.enter_name')}
                    value={newEstablishmentName}
                    onChange={(e) => setNewEstablishmentName(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button variant="primary" type="submit" className="py-2 fw-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                    </svg>
                    {t('establishments.add_button')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold mb-0">{t('establishments.current')}</Card.Title>
              <div className="no-print" style={{ minWidth: '280px' }}>
                <InputGroup size="sm">
                  <InputGroup.Text className="border-end-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder={t('dashboard.search_establishment')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                      ×
                    </Button>
                  )}
                </InputGroup>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">{t('common.name')}</th>
                      <th className="py-3 px-4 text-end no-print">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEstablishments.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          {t('establishments.no_found')}
                        </td>
                      </tr>
                    ) : (
                      filteredEstablishments.map((establishment) => (
                        <tr key={establishment.id}>
                          <td className="py-3 px-4 text-muted small">#{establishment.id.toString().padStart(4, '0')}</td>
                          <td className="py-3 px-4 fw-medium">{establishment.name}</td>
                          <td className="py-3 px-4 text-end no-print">
                            <div className="d-flex justify-content-end gap-2">
                              <Button variant="outline-warning" size="sm" onClick={() => handleEdit(establishment)} title={t('common.edit')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                                </svg>
                              </Button>
                              {userRole === 'administrateur' && (
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(establishment.id)} title={t('common.delete')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                  </svg>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{t('establishments.edit_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted text-uppercase">{t('establishments.name_label')}</Form.Label>
              <Form.Control
                type="text"
                value={editedEstablishmentName}
                onChange={(e) => setEditedEstablishmentName(e.target.value)}
                className="py-2"
              />
            </Form.Group>
            <div className="d-grid">
              <Button variant="primary" type="submit" className="py-2 fw-bold">
                {t('establishments.save_changes')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Establishments;
