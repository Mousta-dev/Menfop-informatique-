import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Form } from 'react-bootstrap';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Home = () => {
  const { t } = useTranslation();
  const [summaryData, setSummaryData] = useState({ totalEquipment: 0, statusCounts: [] });
  const [equipmentByEstablishment, setEquipmentByEstablishment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchDashboardData = async () => {
    try {
      const summaryResponse = await api.get('/dashboard/summary');
      setSummaryData(summaryResponse.data.data);

      const establishmentResponse = await api.get('/dashboard/equipment-by-establishment');
      setEquipmentByEstablishment(establishmentResponse.data.data);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(t('common.error_loading_data') || 'Failed to load dashboard data.');
    }
  };

  const filteredEquipmentByEstablishment = [...equipmentByEstablishment]
    .sort((a, b) => (a.establishment_name || '').localeCompare(b.establishment_name || ''))
    .filter((item) =>
    item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEquipmentByEstablishment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEquipmentByEstablishment.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Prepare data for Pie chart (Equipment by Status)
  const pieChartData = {
    labels: summaryData.statusCounts.map(item => {
      // Translate status labels for the chart
      if (item.status === 'functional') return t('common.functional');
      if (item.status === 'damaged') return t('common.damaged');
      if (item.status === 'repaired') return t('common.repaired');
      if (item.status === 'new') return t('common.new');
      return item.status;
    }),
    datasets: [
      {
        data: summaryData.statusCounts.map(item => item.count),
        backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6c757d'], // Success, Danger, Warning, Info, Secondary
        hoverBackgroundColor: ['#218838', '#c82333', '#e0a800', '#138496', '#5a6268'],
      },
    ],
  };

  // Prepare data for Bar chart (Equipment by Establishment)
  const barChartData = {
    labels: equipmentByEstablishment.map(item => item.establishment_name),
    datasets: [
      {
        label: t('dashboard.count'),
        data: equipmentByEstablishment.map(item => item.equipmentCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: t('dashboard.per_establishment'),
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('dashboard.count'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('sidebar.establishments'),
        },
      },
    },
  };

  return (
    <>
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t('dashboard.overview')}</h1>
          <p className="text-muted mb-0">Bienvenue sur votre tableau de bord Menfop-infos.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="position-relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
            <Form.Control
              type="text"
              placeholder={t('dashboard.search_establishment')}
              className="ps-5"
              style={{ minWidth: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      <Row className="g-4 mb-4">
        <Col xs={12} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column justify-content-center p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-cpu" viewBox="0 0 16 16">
                    <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v1.5h1.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V4h-1.5v1h1.5a.5.5 0 0 1 0 1H13v1h1.5a.5.5 0 0 1 0 1H13v1h1.5a.5.5 0 0 1 0 1H13v1h1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5V13h1.5a.5.5 0 0 1 0 1H13v1.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5V13H2.5a.5.5 0 0 1-.5-.5V11H.5a.5.5 0 0 1 0-1H2V9H.5a.5.5 0 0 1 0-1H2V7H.5a.5.5 0 0 1 0-1H2V5H.5a.5.5 0 0 1 0-1H2V2.5A.5.5 0 0 1 2.5 2H4V.5A.5.5 0 0 1 4.5 0zM4 11V5H3v6zm1-7V3h6v1zm7 1v6h1V5zm-1 7V4h1v1h1.5a.5.5 0 0 0 0-1H11V3a.5.5 0 0 0-.5-.5H4.5A.5.5 0 0 0 4 3v1H2.5a.5.5 0 0 0 0 1H4v6H2.5a.5.5 0 0 0 0 1H4v1.5a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V12h1.5a.5.5 0 0 0 0-1H11v-1h1.5a.5.5 0 0 0 0-1H11V9h1.5a.5.5 0 0 0 0-1H11V7h1.5a.5.5 0 0 0 0-1H11V5z"/>
                  </svg>
                </div>
                <Card.Title className="mb-0 fw-bold">{t('dashboard.total_equipment')}</Card.Title>
              </div>
              <div className="display-4 fw-bold text-primary text-center my-2">
                {summaryData.totalEquipment}
              </div>
              <p className="text-muted text-center small mb-0">Équipements enregistrés au total</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="border-0 pt-4 px-4 pb-0">
              <Card.Title className="fw-bold">{t('dashboard.by_status')}</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>{t('common.status')}</th>
                      <th className="text-end">{t('dashboard.count')}</th>
                      <th>Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.statusCounts.map((item, index) => {
                      const percentage = ((item.count / summaryData.totalEquipment) * 100).toFixed(1);
                      const variant = item.status === 'functional' ? 'success' : 
                                      item.status === 'damaged' ? 'danger' : 
                                      item.status === 'repaired' ? 'warning' : 'info';
                      return (
                        <tr key={index}>
                          <td className="fw-medium text-capitalize">
                            <span className={`badge rounded-pill bg-${variant} me-2`} style={{ width: '8px', height: '8px', display: 'inline-block', padding: 0 }}> </span>
                            {
                              item.status === 'functional' ? t('common.functional') :
                              item.status === 'damaged' ? t('common.damaged') :
                              item.status === 'repaired' ? t('common.repaired') :
                              item.status === 'new' ? t('common.new') : item.status
                            }
                          </td>
                          <td className="text-end fw-bold">{item.count}</td>
                          <td style={{ width: '200px' }}>
                            <div className="progress" style={{ height: '6px' }}>
                              <div 
                                className={`progress-bar bg-${variant}`} 
                                role="progressbar" 
                                style={{ width: `${percentage}%` }}
                                aria-valuenow={percentage} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xs={12} xl={5}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="border-0 pt-4 px-4 pb-2">
              <Card.Title className="fw-bold">{t('dashboard.status_distribution')}</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <div style={{ position: 'relative', height: '320px', width: '100%' }}>
                <Pie 
                  data={pieChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: 12 }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} xl={7}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="border-0 pt-4 px-4 pb-2">
              <Card.Title className="fw-bold">{t('dashboard.per_establishment')}</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <div style={{ position: 'relative', height: '320px', width: '100%' }}>
                <Bar 
                  data={barChartData} 
                  options={{ 
                    ...barChartOptions, 
                    maintainAspectRatio: false,
                    plugins: {
                      ...barChartOptions.plugins,
                      legend: { display: false }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="border-0 d-flex justify-content-between align-items-center pt-4 px-4">
          <Card.Title className="fw-bold mb-0">{t('dashboard.table_view')}</Card.Title>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th className="py-3 px-4">{t('sidebar.establishments')}</th>
                  <th className="py-3 px-4 text-center">{t('dashboard.count')}</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4 fw-medium">{item.establishment_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                        {item.equipmentCount} équipements
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <span className="text-muted small">
                Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredEquipmentByEstablishment.length)} sur {filteredEquipmentByEstablishment.length} établissements
              </span>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  className="px-3"
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                  </svg>
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="px-3"
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>

  </>);
};

export default Home;