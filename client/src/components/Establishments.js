import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import api from '../api';

const Establishments = ({ userRole }) => {
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
      setError('Failed to fetch establishments.');
    }
  };

  const filteredEstablishments = establishments.filter((e) =>
    e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleAddEstablishment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEstablishmentName.trim()) {
      setError('Establishment name cannot be empty.');
      return;
    }
    try {
      await api.post('/establishments', { name: newEstablishmentName });
      setSuccess('Établissement ajouté avec succès !');
      setNewEstablishmentName('');
      fetchEstablishments(); // Refresh the list
    } catch (err) {
      console.error('Error adding establishment:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      setError(`Échec de l'ajout : ${serverError || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (window.confirm('Are you sure you want to delete this establishment?')) {
      try {
        await api.delete(`/establishments/${id}`);
        setSuccess('Établissement supprimé avec succès !');
        fetchEstablishments(); // Refresh the list
      } catch (err) {
        console.error('Error deleting establishment:', err);
        const serverError = err.response?.data?.error || err.response?.data?.message;
        setError(`Échec de la suppression : ${serverError || err.message}`);
      }
    }
  };

  const handleEdit = (establishment) => {
    console.log('Editing establishment:', establishment);
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
      setError('Establishment name cannot be empty.');
      return;
    }
    
    if (!currentEstablishment || !currentEstablishment.id) {
      setError('Erreur interne : Établissement non sélectionné.');
      return;
    }

    try {
      const url = `/establishments/${currentEstablishment.id}`;
      console.log(`Updating establishment at ${url} with name: ${editedEstablishmentName}`);
      const response = await api.put(url, { name: editedEstablishmentName });
      console.log('Update response:', response.data);
      
      setSuccess('Établissement mis à jour avec succès !');
      handleCloseEditModal();
      fetchEstablishments(); // Refresh the list
    } catch (err) {
      console.error('Error updating establishment:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      setError(`Échec de la mise à jour : ${serverError || err.message}`);
    }
  };

  return (
    <div>
      <h1>Establishments</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleAddEstablishment} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Add New Establishment</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter establishment name"
            value={newEstablishmentName}
            onChange={(e) => setNewEstablishmentName(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="px-3 btn-ajouter">
          <span className="me-2">➕</span> Ajouter un établissement
        </Button>
      </Form>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Établissements Actuels</h2>
        <div className="d-flex gap-2" style={{ width: '400px' }}>
            <Form.Control
            type="text"
            placeholder="Rechercher un établissement..."
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
      {filteredEstablishments.length === 0 ? (
        <p>Aucun établissement trouvé.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstablishments.map((establishment) => (
              <tr key={establishment.id}>
                <td>{establishment.id}</td>
                <td>{establishment.name}</td>
                <td className="text-center">
                  <Button variant="warning" size="sm" className="me-2 btn-modifier" onClick={() => handleEdit(establishment)} title="Modifier">
                    ✏️ <span className="d-none d-md-inline ms-1">Modifier</span>
                  </Button>
                  {userRole === 'administrateur' && (
                    <Button variant="danger" size="sm" className="btn-supprimer" onClick={() => handleDelete(establishment.id)} title="Supprimer">
                      🗑️ <span className="d-none d-md-inline ms-1">Supprimer</span>
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
          <Modal.Title>Modifier l'Établissement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'établissement</Form.Label>
              <Form.Control
                type="text"
                value={editedEstablishmentName}
                onChange={(e) => setEditedEstablishmentName(e.target.value)}
              />
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

export default Establishments;