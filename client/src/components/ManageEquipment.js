import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Form, Alert, Modal, Card, Row, Col, Badge, InputGroup, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';

const ManageEquipment = ({ userRole }) => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [establishmentFilter, setEstablishmentFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editedEstablishmentId, setEditedEstablishmentId] = useState('');

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data.data);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(t('common.error_fetch_equipment') || 'Failed to fetch equipment.');
    }
  }, [t]);

  const fetchEstablishments = useCallback(async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError(t('common.error_fetch_establishments') || 'Failed to load establishments.');
    }
  }, [t]);

  useEffect(() => {
    fetchEquipment();
    fetchEstablishments();
  }, [fetchEquipment, fetchEstablishments]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: equipment.length,
      functional: equipment.filter(e => e.status === 'functional').length,
      damaged: equipment.filter(e => e.status === 'damaged').length,
      repaired: equipment.filter(e => e.status === 'repaired').length,
      new: equipment.filter(e => e.status === 'new').length
    };
  }, [equipment]);

  const filteredEquipment = [...equipment]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((item) => {
    const matchesSearch = 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
      (item.establishment_name && item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesEstablishment = establishmentFilter === 'all' || item.establishment_id.toString() === establishmentFilter;

    return matchesSearch && matchesStatus && matchesEstablishment;
  });

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete') || 'Are you sure you want to delete this?')) {
      try {
        await api.delete(`/equipment/${id}`);
        setSuccess(t('common.success_delete') || 'Deleted successfully!');
        fetchEquipment();
      } catch (err) {
        console.error('Error deleting equipment:', err);
        setError(t('common.error_delete') || 'Failed to delete.');
      }
    }
  };

  const handleEdit = (item) => {
    setCurrentEquipment(item);
    setEditedName(item.name);
    setEditedStatus(item.status);
    setEditedEstablishmentId(item.establishment_id);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentEquipment(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/equipment/${currentEquipment.id}`, {
        name: editedName,
        status: editedStatus,
        establishment_id: editedEstablishmentId,
      });
      setSuccess(t('common.success_update') || 'Updated successfully!');
      handleCloseEditModal();
      fetchEquipment();
    } catch (err) {
      console.error('Error updating equipment:', err);
      setError(t('common.error_update') || 'Failed to update.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'functional': return <Badge bg="success">{t('common.functional') || 'Fonctionnel'}</Badge>;
      case 'damaged': return <Badge bg="danger">{t('common.damaged') || 'Endommagé'}</Badge>;
      case 'repaired': return <Badge bg="warning" text="dark">{t('common.repaired') || 'Réparé'}</Badge>;
      case 'new': return <Badge bg="info">{t('common.new') || 'Nouveau'}</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t('sidebar.manage_equipment')}</h1>
          <p className="text-muted mb-0">Visualisez et gérez l'ensemble du parc informatique.</p>
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

      {/* Stats Overview */}
      <Row className="g-4 mb-4 no-print">
        {[
          { label: 'Total', value: stats.total, variant: 'primary', icon: 'cpu' },
          { label: t('common.functional'), value: stats.functional, variant: 'success', icon: 'check-circle' },
          { label: t('common.damaged'), value: stats.damaged, variant: 'danger', icon: 'exclamation-triangle' },
          { label: t('common.repaired'), value: stats.repaired, variant: 'warning', icon: 'wrench' },
          { label: t('common.new'), value: stats.new, variant: 'info', icon: 'stars' }
        ].map((stat, idx) => (
          <Col key={idx} xs={6} md={4} lg={2}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body className="p-3">
                <div className={`text-${stat.variant} mb-2`}>
                   <small className="fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>{stat.label}</small>
                </div>
                <h3 className={`mb-0 fw-bold text-${stat.variant}`}>{stat.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" className="border-0 shadow-sm mb-4" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filters Bar */}
      <Card className="border-0 shadow-sm mb-4 no-print">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-end">
            <Col xs={12} lg={4}>
              <Form.Label className="small fw-bold text-muted text-uppercase">{t('common.search')}</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher un équipement ou établissement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 ps-0 py-2"
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Form.Label className="small fw-bold text-muted text-uppercase">{t('common.status')}</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2">
                <option value="all">{t('equipment.all_statuses')}</option>
                <option value="functional">{t('common.functional')}</option>
                <option value="damaged">{t('common.damaged')}</option>
                <option value="repaired">{t('common.repaired')}</option>
                <option value="new">{t('common.new')}</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Form.Label className="small fw-bold text-muted text-uppercase">{t('sidebar.establishments')}</Form.Label>
              <Form.Select value={establishmentFilter} onChange={(e) => setEstablishmentFilter(e.target.value)} className="py-2">
                <option value="all">{t('equipment.all_establishments')}</option>
                {[...establishments].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-muted small text-uppercase fw-bold" style={{ width: '80px' }}>ID</th>
                <th className="py-3 text-muted small text-uppercase fw-bold">{t('common.name')}</th>
                <th className="py-3 text-muted small text-uppercase fw-bold">{t('common.status')}</th>
                <th className="py-3 text-muted small text-uppercase fw-bold">{t('establishments.name_label')}</th>
                <th className="px-4 py-3 text-muted small text-uppercase fw-bold text-end no-print">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="py-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-search text-light mb-3" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                      </svg>
                      <p className="mb-0">{t('equipment.no_found')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 text-muted small">#{item.id.toString().padStart(4, '0')}</td>
                    <td className="fw-bold">{item.name}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                        <span className="text-muted small fw-medium">
                            {item.establishment_name}
                        </span>
                    </td>
                    <td className="px-4 text-end no-print">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          title={t('common.edit')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                          </svg>
                        </Button>
                        {userRole === 'administrateur' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            title={t('common.delete')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{t('common.edit')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted text-uppercase">{t('common.name')}</Form.Label>
              <Form.Control
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                required
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted text-uppercase">{t('common.status')}</Form.Label>
              <Form.Select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                required
                className="py-2"
              >
                <option value="new">{t('common.new')}</option>
                <option value="functional">{t('common.functional')}</option>
                <option value="damaged">{t('common.damaged')}</option>
                <option value="repaired">{t('common.repaired')}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted text-uppercase">{t('establishments.name_label')}</Form.Label>
              <Form.Select
                value={editedEstablishmentId}
                onChange={(e) => setEditedEstablishmentId(e.target.value)}
                required
                className="py-2"
              >
                {[...establishments].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((establishment) => (
                  <option key={establishment.id} value={establishment.id}>
                    {establishment.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" className="py-2 fw-bold">
                {t('common.save')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageEquipment;
