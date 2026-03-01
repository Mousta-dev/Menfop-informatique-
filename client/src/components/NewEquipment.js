import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import api from '../api';

const NewEquipment = () => {
  const [equipmentName, setEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedEstablishment(response.data.data[0].id); // Set default selected establishment
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Failed to load establishments.');
    }
  };

  const filteredEstablishments = establishments.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Use the first filtered establishment if selectedEstablishment is not in the filtered list
    let establishmentToSubmit = selectedEstablishment;
    if (filteredEstablishments.length > 0 && !filteredEstablishments.find(e => e.id === parseInt(selectedEstablishment))) {
        establishmentToSubmit = filteredEstablishments[0].id;
    }

    if (!equipmentName.trim() || !establishmentToSubmit) {
      setError('Please fill in all fields (make sure an establishment is selected).');
      return;
    }

    try {
      await api.post('/equipment', {
        name: equipmentName,
        status: 'new', // Default status for new equipment
        establishment_id: establishmentToSubmit,
      });
      setSuccess('New equipment added successfully!');
      setEquipmentName('');
    } catch (err) {
      console.error('Error adding new equipment:', err);
      setError('Failed to add new equipment.');
    }
  };

  return (
    <div>
      <h1>Add New Equipment</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label><strong>Rechercher un établissement :</strong></Form.Label>
            <Form.Control
              type="text"
              placeholder="Filtrer la liste des établissements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Equipment Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter equipment name"
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Establishment {searchTerm && `(Filtered by "${searchTerm}")`}</Form.Label>
          <Form.Select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
          >
            {filteredEstablishments.length === 0 ? (
                <option value="">No establishments found</option>
            ) : (
                filteredEstablishments.map((establishment) => (
                    <option key={establishment.id} value={establishment.id}>
                        {establishment.name}
                    </option>
                ))
            )}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={filteredEstablishments.length === 0}>
          Add Equipment
        </Button>
      </Form>
    </div>
  );
};

export default NewEquipment;
