import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal } from 'react-bootstrap';
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
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
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
      fetchEstablishments(); // Refresh the list
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
        fetchEstablishments(); // Refresh the list
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
    setError(''); // Clear error on close
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editedEstablishmentName.trim()) {
      setError(t('establishments.error_empty'));
      return;
    }
    
    if (!currentEstablishment || !currentEstablishment.id) {
      setError(t('common.error'));
      return;
    }

    try {
      const url = `/establishments/${currentEstablishment.id}`;
      await api.put(url, { name: editedEstablishmentName });
      setSuccess(t('establishments.success_update'));
      handleCloseEditModal();
      fetchEstablishments(); // Refresh the list
    } catch (err) {
      console.error('Error updating establishment:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      setError(`${t('establishments.error_update')} : ${serverError || err.message}`);
    }
  };

  return (
    <div>
      <h1>{t('establishments.title')}</h1>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleAddEstablishment} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>{t('establishments.add_new')}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t('establishments.enter_name')}
            value={newEstablishmentName}
            onChange={(e) => setNewEstablishmentName(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="px-3 btn-ajouter">
          <span className="me-2">➕</span> {t('establishments.add_button')}
        </Button>
      </Form>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t('establishments.current')}</h2>
        <div className="d-flex gap-2" style={{ width: '400px' }}>
            <Form.Control
            type="text"
            placeholder={t('dashboard.search_establishment')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    {t('establishments.clear')}
                </Button>
            )}
        </div>
      </div>
      {filteredEstablishments.length === 0 ? (
        <p>{t('establishments.no_found')}</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('common.name')}</th>
              <th className="text-center">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstablishments.map((establishment) => (
              <tr key={establishment.id}>
                <td>{establishment.id}</td>
                <td>{establishment.name}</td>
                <td className="text-center">
                  <Button variant="warning" size="sm" className="me-2 btn-modifier" onClick={() => handleEdit(establishment)} title={t('common.edit')}>
                    ✏️
                  </Button>
                  {userRole === 'administrateur' && (
                    <Button variant="danger" size="sm" className="btn-supprimer" onClick={() => handleDelete(establishment.id)} title={t('common.delete')}>
                      🗑️
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit Establishment Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('establishments.edit_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('establishments.name_label')}</Form.Label>
              <Form.Control
                type="text"
                value={editedEstablishmentName}
                onChange={(e) => setEditedEstablishmentName(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {t('establishments.save_changes')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Establishments;