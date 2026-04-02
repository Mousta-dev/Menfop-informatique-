import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Form, Alert, Modal, Card, Row, Col, Badge, InputGroup } from 'react-bootstrap';
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
      new: equipment.filter(e => e.status === 'new').length
    };
  }, [equipment]);

  const filteredEquipment = equipment.filter((item) => {
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
      case 'new': return <Badge bg="info">{t('common.new') || 'Nouveau'}</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="py-2">
      <h1 className="mb-4">{t('sidebar.manage_equipment')}</h1>

      {/* Stats Overview */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="text-muted small mb-1 uppercase font-weight-bold">Total</div>
              <h3 className="mb-0 text-primary">{stats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="text-muted small mb-1">Fonctionnel</div>
              <h3 className="mb-0 text-success">{stats.functional}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="text-muted small mb-1">Endommagé</div>
              <h3 className="mb-0 text-danger">{stats.damaged}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="text-muted small mb-1">Nouveau</div>
              <h3 className="mb-0 text-info">{stats.new}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Filters Bar */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col lg={4}>
              <InputGroup size="sm">
                <Form.Control
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    ×
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6} lg={4}>
              <Form.Select size="sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tous les statuts</option>
                <option value="functional">Fonctionnel</option>
                <option value="damaged">Endommagé</option>
                <option value="new">Nouveau</option>
              </Form.Select>
            </Col>
            <Col md={6} lg={4}>
              <Form.Select size="sm" value={establishmentFilter} onChange={(e) => setEstablishmentFilter(e.target.value)}>
                <option value="all">Tous les établissements</option>
                {establishments.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table */}
      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 text-muted" style={{ width: '80px' }}>ID</th>
                <th className="py-3 text-muted">{t('common.name')}</th>
                <th className="py-3 text-muted">{t('common.status')}</th>
                <th className="py-3 text-muted">Établissement</th>
                <th className="px-4 py-3 text-muted text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Aucun équipement trouvé.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 text-muted small">#{item.id}</td>
                    <td className="fw-bold">{item.name}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                        <span className="text-muted small">
                            {item.establishment_name}
                        </span>
                    </td>
                    <td className="px-4 text-end">
                      <Button 
                        variant="warning" 
                        size="sm" 
                        className="me-2" 
                        onClick={() => handleEdit(item)}
                        title={t('common.edit')}
                      >
                        ✏️ <span className="d-none d-md-inline ms-1">{t('common.edit')}</span>
                      </Button>
                      {userRole === 'administrateur' && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDelete(item.id)}
                          title={t('common.delete')}
                        >
                          🗑️ <span className="d-none d-md-inline ms-1">{t('common.delete')}</span>
                        </Button>
                      )}
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
          <Modal.Title className="h5 fw-bold">{t('common.edit')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">{t('common.name')}</Form.Label>
              <Form.Control
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">{t('common.status')}</Form.Label>
              <Form.Select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                required
              >
                <option value="new">Nouveau</option>
                <option value="functional">Fonctionnel</option>
                <option value="damaged">Endommagé</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Établissement</Form.Label>
              <Form.Select
                value={editedEstablishmentId}
                onChange={(e) => setEditedEstablishmentId(e.target.value)}
                required
              >
                {establishments.map((establishment) => (
                  <option key={establishment.id} value={establishment.id}>
                    {establishment.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" className="py-2">
                {t('common.save')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageEquipment;
