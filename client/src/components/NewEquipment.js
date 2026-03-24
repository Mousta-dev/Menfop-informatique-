import React, { useState, useEffect, useMemo } from 'react';
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
      const data = response.data.data || [];
      setEstablishments(data);
      if (data.length > 0) {
        setSelectedEstablishment(String(data[0].id));
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Échec du chargement des établissements.');
    }
  };

  const filteredEstablishments = useMemo(() => {
    return establishments.filter((e) =>
      e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [establishments, searchTerm]);

  // Sync selectedEstablishment when filter changes
  useEffect(() => {
    if (filteredEstablishments.length > 0) {
      const currentExists = filteredEstablishments.some(e => String(e.id) === String(selectedEstablishment));
      if (!currentExists) {
        setSelectedEstablishment(String(filteredEstablishments[0].id));
      }
    } else if (searchTerm.trim() !== '' && filteredEstablishments.length === 0) {
        if (selectedEstablishment !== '') setSelectedEstablishment('');
    } else if (searchTerm.trim() === '' && establishments.length > 0 && selectedEstablishment === '') {
        setSelectedEstablishment(String(establishments[0].id));
    }
  }, [filteredEstablishments, selectedEstablishment, establishments, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!equipmentName.trim() || !selectedEstablishment) {
      setError('Veuillez remplir tous les champs (assurez-vous qu\'un établissement est sélectionné).');
      return;
    }

    try {
      await api.post('/equipment', {
        name: equipmentName,
        status: 'new',
        establishment_id: parseInt(selectedEstablishment),
      });
      setSuccess('Nouvel équipement ajouté avec succès !');
      setEquipmentName('');
    } catch (err) {
      console.error('Error adding new equipment:', err);
      setError('Échec de l\'ajout du nouvel équipement.');
    }
  };

  return (
    <div>
      <h1>Ajouter un nouvel équipement</h1>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label><strong>Rechercher un établissement :</strong></Form.Label>
            <div className="d-flex gap-2">
                <Form.Control
                type="text"
                placeholder="Filtrer la liste des établissements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                        Effacer
                    </Button>
                )}
            </div>
          </Form.Group>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nom de l'équipement</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez le nom de l'équipement"
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {searchTerm.trim() ? `Établissement (Filtré par "${searchTerm}")` : "Établissement"}
          </Form.Label>
          <Form.Select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
          >
            {filteredEstablishments.length === 0 ? (
                <option value="">Aucun établissement trouvé</option>
            ) : (
                filteredEstablishments.map((establishment) => (
                    <option key={establishment.id} value={String(establishment.id)}>
                        {establishment.name}
                    </option>
                ))
            )}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={!selectedEstablishment || !equipmentName.trim()}>
          Ajouter l'équipement
        </Button>
      </Form>
    </div>
  );
};

export default NewEquipment;
