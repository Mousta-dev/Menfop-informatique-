import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import api from '../api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Form } from 'react-bootstrap';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Home = () => {
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
      setError('Failed to load dashboard data.');
    }
  };

  const filteredEquipmentByEstablishment = equipmentByEstablishment.filter((item) =>
    item.establishment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for Pie chart (Equipment by Status)
  const pieChartData = {
    labels: summaryData.statusCounts.map(item => item.status),
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
        label: 'Equipment Count',
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
        text: 'Equipment Count by Establishment',
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
          text: 'Number of Equipment',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Establishment',
        },
      },
    },
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Dashboard Overview</h1>
        <Form.Control
          type="text"
          placeholder="Rechercher un établissement..."
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
              <Card.Title>Total Equipment</Card.Title>
              <Card.Text className="fs-1 text-center py-4">{summaryData.totalEquipment}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Equipment by Status</Card.Title>
              <div className="table-responsive">
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.statusCounts.map((item, index) => (
                      <tr key={index}>
                        <td>{item.status}</td>
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
              <Card.Title>Equipment Status Distribution</Card.Title>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Equipment per Establishment</Card.Title>
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
              <Card.Title>Equipment Count by Establishment (Table)</Card.Title>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Establishment</th>
                      <th>Equipment Count</th>
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