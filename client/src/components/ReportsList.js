import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button, Form, Container, InputGroup } from 'react-bootstrap';
import api from '../api';
import { Link } from 'react-router-dom';

const ReportsList = () => {
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
      setError('Impossible de charger les rapports.');
    }
  };

  const filteredReports = [...reports]
    .sort((a, b) => b.id - a.id)
    .filter((report) =>
      report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toString().includes(searchTerm)
    );

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Liste des Rapports</h1>
          <p className="text-muted mb-0">Consultez et recherchez parmi tous les rapports archivés.</p>
        </div>
        <div className="d-flex gap-2 no-print align-items-center">
            <div className="position-relative" style={{ minWidth: '300px' }}>
                <InputGroup size="sm">
                    <InputGroup.Text className="border-end-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                        </svg>
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Rechercher un rapport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-start-0 ps-0 py-2"
                    />
                </InputGroup>
            </div>
            <Button variant="outline-primary" onClick={() => window.print()} className="py-2 px-3 fw-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer me-2" viewBox="0 0 16 16">
                    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
                </svg>
                Imprimer
            </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">ID</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Extrait du contenu</th>
                <th className="py-3 px-4 text-muted small text-uppercase fw-bold">Date de création</th>
                <th className="py-3 px-4 text-end text-muted small text-uppercase fw-bold no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">Aucun rapport trouvé.</td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td className="py-3 px-4 text-muted small">#{report.id.toString().padStart(4, '0')}</td>
                    <td className="py-3 px-4 fw-medium" style={{ maxWidth: '400px' }}>
                        <div className="text-truncate">{report.content}</div>
                    </td>
                    <td className="py-3 px-4 text-muted small">
                        {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-end no-print">
                      <Button as={Link} to={`/reports/${report.id}`} variant="outline-primary" size="sm" className="fw-bold px-3">
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </Container>
  );
};

export default ReportsList;
