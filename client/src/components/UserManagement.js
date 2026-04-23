import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal, Card } from 'react-bootstrap';
import api from '../api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('utilisateur');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editedUsername, setEditedUsername] = useState('');
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
    .sort((a, b) => (a.username || '').localeCompare(b.username || ''))
    .filter((user) => user.username !== sessionStorage.getItem('username'))
    .filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const trimmedUsername = newUsername.trim();
    const trimmedPassword = newPassword.trim();
    const trimmedRole = newRole.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Le nom d'utilisateur et le mot de passe sont requis.");
      return;
    }
    try {
      await api.post('/users', { 
        username: trimmedUsername, 
        password: trimmedPassword, 
        role: trimmedRole 
      });
      setSuccess('Utilisateur ajouté avec succès !');
      setNewUsername('');
      setNewPassword('');
      setNewRole('utilisateur');
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError("Erreur lors de l'ajout de l'utilisateur.");
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    console.log(`Tentative de suppression de l'utilisateur ID: ${id}`);
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const url = `/users/${id}`;
        console.log(`Appel API DELETE sur: ${url}`);
        const response = await api.delete(url);
        setSuccess(response.data.message || 'Utilisateur supprimé.');
        fetchUsers();
      } catch (err) {
        console.error('Full error object:', err);
        const serverError = err.response?.data?.error || err.response?.data?.message;
        const status = err.response?.status;
        
        if (serverError) {
          setError(`${serverError} (Code: ${status})`);
        } else if (status === 403) {
          setError("Session expirée ou droits insuffisants. Veuillez vous reconnecter.");
        } else {
          setError(`Erreur technique : ${err.message} (Code: ${status || 'Réseau'})`);
        }
      }
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setEditedUsername(user.username);
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
    try {
      const trimmedUsername = editedUsername.trim();
      const trimmedRole = editedRole.trim();
      const updateData = { username: trimmedUsername, role: trimmedRole };
      
      if (editedPassword && editedPassword.trim()) {
        updateData.password = editedPassword.trim();
      }

      await api.put(`/users/${currentUser.id}`, updateData);
      setSuccess('Utilisateur mis à jour !');
      handleCloseEditModal();
      fetchUsers();
    } catch (err) {
      setError('Erreur lors de la mise à jour.');
    }
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Utilisateurs</h1>
        <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Rechercher un utilisateur..."
              style={{ width: '300px', marginRight: '10px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={fetchUsers}>Actualiser la liste</Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4 bg-light">
        <Card.Body>
          <Card.Title>Rôles disponibles :</Card.Title>
          <ul className="mb-0">
            <li><strong>Administrateur :</strong> Accès total (Voir, Ajouter, Modifier, Supprimer tout).</li>
            <li><strong>Utilisateur :</strong> Accès limité (Voir, Ajouter, Modifier les données, mais <u>interdiction de supprimer</u>).</li>
          </ul>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Ajouter un nouvel utilisateur</Card.Title>
          <Form onSubmit={handleAddUser} className="row g-3">
            <div className="col-md-3">
              <Form.Control
                placeholder="Nom d'utilisateur"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <Form.Control
                type="password"
                placeholder="Mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="utilisateur">Utilisateur</option>
                <option value="administrateur">Administrateur</option>
              </Form.Select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <Button variant="success" type="submit" className="px-3 btn-ajouter">
                <span className="me-2">➕</span> Ajouter
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom d'utilisateur</th>
            <th>Rôle</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>
                <span className={`badge ${user.role === 'administrateur' ? 'bg-danger' : 'bg-primary'}`}>
                  {user.role}
                </span>
              </td>
              <td className="text-center">
                <Button variant="warning" size="sm" className="me-2 btn-modifier" onClick={() => handleEdit(user)} title="Modifier">
                  ✏️
                </Button>
                <Button variant="danger" size="sm" className="btn-supprimer" onClick={() => handleDelete(user.id)} title="Supprimer">
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rôle</Form.Label>
              <Form.Select value={editedRole} onChange={(e) => setEditedRole(e.target.value)}>
                <option value="utilisateur">Utilisateur</option>
                <option value="administrateur">Administrateur</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe (laisser vide pour ne pas changer)</Form.Label>
              <Form.Control
                type="password"
                value={editedPassword}
                onChange={(e) => setEditedPassword(e.target.value)}
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

export default UserManagement;
