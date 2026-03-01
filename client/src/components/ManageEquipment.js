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
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await api.delete(`/equipment/${id}`);
        setSuccess('Equipment deleted successfully!');
        fetchEquipment(); // Refresh the list
      } catch (err) {
        console.error('Error deleting equipment:', err);
        setError('Failed to delete equipment.');
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
      setError('All fields are required.');
      return;
    }
    try {
      await api.put(`/equipment/${currentEquipment.id}`, {
        name: editedName,
        status: editedStatus,
        establishment_id: editedEstablishmentId,
      });
      setSuccess('Equipment updated successfully!');
      handleCloseEditModal();
      fetchEquipment(); // Refresh the list
    } catch (err) {
      console.error('Error updating equipment:', err);
      setError('Failed to update equipment.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Manage All Equipment</h1>
        <Form.Control
          type="text"
          placeholder="Rechercher un équipement..."
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {filteredEquipment.length === 0 ? (
        <p>No equipment found.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Establishment</th>
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
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(item)}>Edit</Button>
                  {userRole === 'administrateur' && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit Equipment Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Equipment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Equipment Name</Form.Label>
              <Form.Control
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
              >
                <option value="new">New</option>
                <option value="functional">Functional</option>
                <option value="damaged">Damaged</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Establishment</Form.Label>
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
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageEquipment;
