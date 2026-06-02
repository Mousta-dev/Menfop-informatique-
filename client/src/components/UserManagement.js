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
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Gestion des Utilisateurs</h1>
          <p className="text-muted mb-0">Gérez les accès et les permissions de votre équipe.</p>
        </div>
        <div className="d-flex gap-2 align-items-center no-print">
            <div className="position-relative" style={{ minWidth: '280px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
                <Form.Control
                type="text"
                placeholder="Rechercher..."
                className="ps-5 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline-primary" onClick={fetchUsers} className="py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise me-1" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                </svg>
            </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" className="border-0 shadow-sm mb-4" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="border-0 shadow-sm mb-4 no-print">
        <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
          <Card.Title className="fw-bold">Ajouter un nouvel utilisateur</Card.Title>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleAddUser}>
            <Row className="g-3 mb-3">
                <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Nom d'utilisateur (Optionnel)</Form.Label>
                    <Form.Control
                        placeholder="Ex: Alpha"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="py-2"
                    />
                </Col>
                <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Ex: admin@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="py-2"
                    />
                </Col>
                <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Téléphone (8 chiffres)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ex: 12345678"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        maxLength={8}
                        className="py-2"
                    />
                </Col>
            </Row>
            <Row className="g-3 align-items-end">
                <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="py-2"
                    />
                </Col>
                <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Rôle</Form.Label>
                    <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="py-2">
                        <option value="utilisateur">Utilisateur</option>
                        <option value="administrateur">Administrateur</option>
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus-fill me-2" viewBox="0 0 16 16">
                            <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                            <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                        Ajouter l'utilisateur
                    </Button>
                </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Nom / Identifier</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Email</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Téléphone</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Rôle</th>
                <th className="py-3 px-4 text-end text-muted small text-uppercase fw-bold no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 px-4 fw-bold">{user.username || '-'}</td>
                    <td className="py-3 px-4 text-muted small fw-medium">{user.email || '-'}</td>
                    <td className="py-3 px-4 text-muted small fw-medium">{user.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${user.role === 'administrateur' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end no-print">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(user)} title="Modifier">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                          </svg>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user.id)} title="Supprimer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Modifier l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <Row className="g-3 mb-3">
                <Col md={6}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Nom d'utilisateur</Form.Label>
                    <Form.Control
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        className="py-2"
                    />
                </Col>
                <Col md={6}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Rôle</Form.Label>
                    <Form.Select value={editedRole} onChange={(e) => setEditedRole(e.target.value)} className="py-2">
                        <option value="utilisateur">Utilisateur</option>
                        <option value="administrateur">Administrateur</option>
                    </Form.Select>
                </Col>
            </Row>
            <Row className="g-3 mb-3">
                <Col md={6}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="py-2"
                    />
                </Col>
                <Col md={6}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Téléphone (8 chiffres)</Form.Label>
                    <Form.Control
                        type="text"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        maxLength={8}
                        className="py-2"
                    />
                </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted text-uppercase">Nouveau mot de passe (laisser vide pour ne pas changer)</Form.Label>
              <Form.Control
                type="password"
                value={editedPassword}
                onChange={(e) => setEditedPassword(e.target.value)}
                className="py-2"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" onClick={handleCloseEditModal} className="px-4 fw-bold">Annuler</Button>
                <Button variant="primary" type="submit" className="px-4 fw-bold">Enregistrer</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserManagement;