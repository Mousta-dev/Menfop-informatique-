import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Form, Button, Card } from 'react-bootstrap';
import api from '../api';

const FunctionalEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');

  const fetchFunctionalEquipment = useCallback(async () => {
    try {
      const response = await api.get('/equipment/functional');
      setEquipment(response.data.data);
    } catch (err) {
      console.error('Error fetching functional equipment:', err);
      setError('Failed to fetch functional equipment.');
    }
  }, []);

  const fetchEstablishments = useCallback(async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedEstablishment(response.data.data[0].id); // Set default selected establishment
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Failed to load establishments for adding equipment.');
    }
  }, []);

  useEffect(() => {
    fetchFunctionalEquipment();
    fetchEstablishments();
  }, [fetchFunctionalEquipment, fetchEstablishments]);

  const filteredEquipment = [...equipment]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFunctionalEquipment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEquipmentName.trim() || !selectedEstablishment) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await api.post('/equipment', {
        name: newEquipmentName,
        status: 'functional', // Fixed status for functional equipment
        establishment_id: selectedEstablishment,
      });
      setSuccess('Functional equipment added successfully!');
      setNewEquipmentName('');
      fetchFunctionalEquipment(); // Refresh the list of functional equipment
    } catch (err) {
      console.error('Error adding functional equipment:', err);
      setError('Failed to add functional equipment.');
    }
  };

  return (
    <div>
      <h1>Functional Equipment</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Add Functional Equipment Manually</Card.Title>
          <Form onSubmit={handleAddFunctionalEquipment}>
            <Form.Group className="mb-3">
              <Form.Label>Equipment Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter equipment name"
                value={newEquipmentName}
                onChange={(e) => setNewEquipmentName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Establishment</Form.Label>
              <Form.Select
                value={selectedEstablishment}
                onChange={(e) => setSelectedEstablishment(e.target.value)}
                disabled={establishments.length === 0}
              >
                {establishments.length === 0 ? (
                  <option>Loading establishments...</option>
                ) : (
                  [...establishments].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((establishment) => (
                    <option key={establishment.id} value={establishment.id}>
                      {establishment.name}
                    </option>
                  ))
                )}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={establishments.length === 0}>
              Add Functional Equipment
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>List of Functional Equipment</h2>
        <Form.Control
          type="text"
          placeholder="Rechercher un équipement..."
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredEquipment.length === 0 ? (
        <p>No functional equipment found.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Establishment</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.establishment_name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default FunctionalEquipment;
