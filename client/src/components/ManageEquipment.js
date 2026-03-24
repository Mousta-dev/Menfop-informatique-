import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import api from '../api';

const ManageEquipment = ({ userRole }) => {
  const [equipment, setEquipment] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editedEstablishmentId, setEditedEstablishmentId] = useState('');

  useEffect(() => {
    fetchEquipment();
    fetchEstablishments();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data.data);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to fetch equipment.');
    }
  };

  const filteredEquipment = equipment.filter((item) =>
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
    (item.establishment_name && item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
    (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase().trim()))
  );

  const fetchEstablishments = async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Failed to load establishments for editing.');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        await api.delete(`/equipment/${id}`);
        setSuccess('Équipement supprimé avec succès !');
        fetchEquipment(); // Refresh the list
      } catch (err) {
        console.error('Error deleting equipment:', err);
        setError('Échec de la suppression de l\'équipement.');
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
    setEditedName('');
    setEditedStatus('');
    setEditedEstablishmentId('');
    setError(''); // Clear error on close
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editedName.trim() || !editedStatus || !editedEstablishmentId) {
      setError('Tous les champs sont requis.');
      return;
    }
    try {
      await api.put(`/equipment/${currentEquipment.id}`, {
        name: editedName,
        status: editedStatus,
        establishment_id: editedEstablishmentId,
      });
      setSuccess('Équipement mis à jour avec succès !');
      handleCloseEditModal();
      fetchEquipment(); // Refresh the list
    } catch (err) {
      console.error('Error updating equipment:', err);
      setError('Échec de la mise à jour de l\'équipement.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <h1 className="mb-3 mb-md-0">Gérer tous les équipements</h1>
        <div className="d-flex gap-2 w-100 w-md-auto" style={{ maxWidth: '400px' }}>
            <Form.Control
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    Effacer
                </Button>
            )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {filteredEquipment.length === 0 ? (
        <p>Aucun équipement trouvé.</p>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>Établissement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.status}</td>
                  <td>{item.establishment_name}</td>
                  <td className="text-nowrap">
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(item)}>Modifier</Button>
                    {userRole === 'administrateur' && (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Supprimer</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Edit Equipment Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'équipement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'équipement</Form.Label>
              <Form.Control
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
              >
                <option value="new">Nouveau</option>
                <option value="functional">Fonctionnel</option>
                <option value="damaged">Endommagé</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Établissement</Form.Label>
              <Form.Select
                value={editedEstablishmentId}
                onChange={(e) => setEditedEstablishmentId(e.target.value)}
              >
                {establishments.map((establishment) => (
                  <option key={establishment.id} value={establishment.id}>
                    {establishment.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              Enregistrer les modifications
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageEquipment;
