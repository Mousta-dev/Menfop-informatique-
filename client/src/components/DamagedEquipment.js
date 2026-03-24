import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Form, Button, Card } from 'react-bootstrap';
import api from '../api';

const DamagedEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');

  const fetchDamagedEquipment = useCallback(async () => {
    try {
      const response = await api.get('/equipment/damaged');
      setEquipment(response.data.data);
    } catch (err) {
      console.error('Error fetching damaged equipment:', err);
      setError('Failed to fetch damaged equipment.');
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
      // Only set error if no establishments can be fetched
      setError('Failed to load establishments for adding equipment.');
    }
  }, []);

  useEffect(() => {
    fetchDamagedEquipment();
    fetchEstablishments();
  }, [fetchDamagedEquipment, fetchEstablishments]);

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDamagedEquipment = async (e) => {
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
        status: 'damaged', // Fixed status for damaged equipment
        establishment_id: selectedEstablishment,
      });
      setSuccess('Damaged equipment added successfully!');
      setNewEquipmentName('');
      fetchDamagedEquipment(); // Refresh the list of damaged equipment
    } catch (err) {
      console.error('Error adding damaged equipment:', err);
      setError('Failed to add damaged equipment.');
    }
  };

  return (
    <div>
      <h1>Damaged Equipment</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Add Damaged Equipment Manually</Card.Title>
          <Form onSubmit={handleAddDamagedEquipment}>
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
                  establishments.map((establishment) => (
                    <option key={establishment.id} value={establishment.id}>
                      {establishment.name}
                    </option>
                  ))
                )}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={establishments.length === 0}>
              Add Damaged Equipment
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>List of Damaged Equipment</h2>
        <Form.Control
          type="text"
          placeholder="Rechercher un équipement..."
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredEquipment.length === 0 ? (
        <p>No damaged equipment found.</p>
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

export default DamagedEquipment;
