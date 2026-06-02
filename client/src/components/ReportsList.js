import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button, Form } from 'react-bootstrap';
import api from '../api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ReportsList = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports.');
    }
  };

  const filteredReports = [...reports]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((report) =>
      report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toString().includes(searchTerm)
    );

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h1 className="mb-0">Liste des Rapports</h1>
        <Button variant="outline-primary" onClick={() => window.print()}>
          🖨️ {t('common.print') || 'Imprimer'}
        </Button>
      </div>

      <div className="d-flex justify-content-end mb-3 no-print">
        <Form.Control
          type="text"
          placeholder="Rechercher un rapport..."
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {error && <Alert variant="danger">{error}</Alert>}

      {filteredReports.length === 0 ? (
        <Alert variant="info">Aucun rapport trouvé.</Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Contenu (Extrait)</th>
                  <th>Date de Création</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.content.substring(0, 100)}...</td> {/* Show first 100 chars */}
                    <td>{new Date(report.created_at).toLocaleString()}</td>
                    <td className="no-print">
                      <Button as={Link} to={`/reports/${report.id}`} variant="info" size="sm" title="Voir">
                        👁️ <span className="d-none d-md-inline ms-1">Voir</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ReportsList;
