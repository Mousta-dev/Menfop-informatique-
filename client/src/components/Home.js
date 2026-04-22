import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert } from 'react-bootstrap';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  // Prepare data for Pie chart (Equipment by Status)
  const pieChartData = {
    labels: summaryData.statusCounts.map(item => {
      // Translate status labels for the chart
      if (item.status === 'functional') return t('common.functional');
      if (item.status === 'damaged') return t('common.damaged');
      if (item.status === 'new') return t('common.new');
      return item.status;
    }),
    datasets: [
      {
        data: summaryData.statusCounts.map(item => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'], // Customize colors
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
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
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{t('dashboard.overview')}</h1>
        <Form.Control
          type="text"
          placeholder={t('dashboard.search_establishment')}
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>{t('dashboard.total_equipment')}</Card.Title>
              <Card.Text className="fs-1 text-center py-4">{summaryData.totalEquipment}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>{t('dashboard.by_status')}</Card.Title>
              <div className="table-responsive">
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>{t('common.status')}</th>
                      <th>{t('dashboard.count')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.statusCounts.map((item, index) => (
                      <tr key={index}>
                        <td>{
                          item.status === 'functional' ? t('common.functional') :
                          item.status === 'damaged' ? t('common.damaged') :
                          item.status === 'new' ? t('common.new') : item.status
                        }</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>{t('dashboard.status_distribution')}</Card.Title>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>{t('dashboard.per_establishment')}</Card.Title>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar data={barChartData} options={{ ...barChartOptions, maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Card.Title>{t('dashboard.table_view')}</Card.Title>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>{t('sidebar.establishments')}</th>
                      <th>{t('dashboard.count')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipmentByEstablishment.map((item, index) => (
                      <tr key={index}>
                        <td>{item.establishment_name}</td>
                        <td>{item.equipmentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;