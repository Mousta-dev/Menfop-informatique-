import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal, Card } from 'react-bootstrap';
import api from '../api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('utilisateur');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedRole, setEditedRole] = useState('');
  const [editedPassword, setEditedPassword] = useState(''); // Optional

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Impossible de charger les utilisateurs.');
    }
  };

  const filteredUsers = [...users]
    .sort((a, b) => (a.username || a.email || a.phone || '').localeCompare(b.username || b.email || b.phone || ''))
    .filter((user) => user.username !== sessionStorage.getItem('username'))
    .filter((user) =>
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const trimmedUsername = newUsername.trim();
    const trimmedEmail = newEmail.trim();
    const trimmedPhone = newPhone.trim();
    const trimmedPassword = newPassword.trim();
    const trimmedRole = newRole.trim();

    if (!trimmedPassword) {
      setError("Le mot de passe est requis.");
      return;
    }

    if (!trimmedEmail && !trimmedPhone) {
        setError("L'email ou le numéro de téléphone est requis.");
        return;
    }

    if (trimmedPhone && !/^\d{8}$/.test(trimmedPhone)) {
        setError("Le numéro de téléphone doit comporter exactement 8 chiffres.");
        return;
    }

    try {
      await api.post('/users', { 
        username: trimmedUsername, 
        email: trimmedEmail,
        phone: trimmedPhone,
        password: trimmedPassword, 
        role: trimmedRole 
      });
      setSuccess('Utilisateur ajouté avec succès !');
      setNewUsername('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewRole('utilisateur');
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.error || "Erreur lors de l'ajout de l'utilisateur.");
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await api.delete(`/users/${id}`);
        setSuccess(response.data.message || 'Utilisateur supprimé.');
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Erreur lors de la suppression.");
      }
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setEditedUsername(user.username || '');
    setEditedEmail(user.email || '');
    setEditedPhone(user.phone || '');
    setEditedRole(user.role);
    setEditedPassword('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentUser(null);
    setError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedUsername = editedUsername.trim();
    const trimmedEmail = editedEmail.trim();
    const trimmedPhone = editedPhone.trim();
    const trimmedRole = editedRole.trim();

    if (!trimmedEmail && !trimmedPhone) {
        setError("L'email ou le numéro de téléphone est requis.");
        return;
    }

    if (trimmedPhone && !/^\d{8}$/.test(trimmedPhone)) {
        setError("Le numéro de téléphone doit comporter exactement 8 chiffres.");
        return;
    }

    try {
      const updateData = { 
        username: trimmedUsername, 
        email: trimmedEmail,
        phone: trimmedPhone,
        role: trimmedRole 
      };
      
      if (editedPassword && editedPassword.trim()) {
        updateData.password = editedPassword.trim();
      }

      await api.put(`/users/${currentUser.id}`, updateData);
      setSuccess('Utilisateur mis à jour !');
      handleCloseEditModal();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
    }
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Utilisateurs</h1>
        <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              style={{ width: '300px', marginRight: '10px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={fetchUsers}>Actualiser</Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Ajouter un nouvel utilisateur</Card.Title>
          <Form onSubmit={handleAddUser}>
            <div className="row g-3">
                <div className="col-md-4">
                <Form.Group>
                    <Form.Label>Nom d'utilisateur (Optionnel)</Form.Label>
                    <Form.Control
                        placeholder="Ex: Alpha"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                </Form.Group>
                </div>
                <div className="col-md-4">
                <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Ex: admin@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                </Form.Group>
                </div>
                <div className="col-md-4">
                <Form.Group>
                    <Form.Label>Téléphone (8 chiffres)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ex: 12345678"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        maxLength={8}
                    />
                </Form.Group>
                </div>
            </div>
            <div className="row g-3 mt-1">
                <div className="col-md-4">
                <Form.Group>
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                </div>
                <div className="col-md-4">
                <Form.Group>
                    <Form.Label>Rôle</Form.Label>
                    <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                        <option value="utilisateur">Utilisateur</option>
                        <option value="administrateur">Administrateur</option>
                    </Form.Select>
                </Form.Group>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                <Button variant="success" type="submit" className="w-100">
                    <span className="me-2">➕</span> Ajouter l'utilisateur
                </Button>
                </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nom / Identifier</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.username || '-'}</td>
              <td>{user.email || '-'}</td>
              <td>{user.phone || '-'}</td>
              <td>
                <span className={`badge ${user.role === 'administrateur' ? 'bg-danger' : 'bg-primary'}`}>
                  {user.role}
                </span>
              </td>
              <td className="text-center">
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(user)} title="Modifier">
                  ✏️
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)} title="Supprimer">
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <Form.Label>Nom d'utilisateur</Form.Label>
                    <Form.Control
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <Form.Label>Rôle</Form.Label>
                    <Form.Select value={editedRole} onChange={(e) => setEditedRole(e.target.value)}>
                        <option value="utilisateur">Utilisateur</option>
                        <option value="administrateur">Administrateur</option>
                    </Form.Select>
                </div>
            </div>
            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <Form.Label>Téléphone (8 chiffres)</Form.Label>
                    <Form.Control
                        type="text"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        maxLength={8}
                    />
                </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe (laisser vide pour ne pas changer)</Form.Label>
              <Form.Control
                type="password"
                value={editedPassword}
                onChange={(e) => setEditedPassword(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseEditModal}>Annuler</Button>
                <Button variant="primary" type="submit">Enregistrer</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagement;