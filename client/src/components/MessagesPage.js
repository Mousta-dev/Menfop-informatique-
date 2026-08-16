import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MessageBox from './MessageBox';
import { useNavigate } from 'react-router-dom';

const MessagesPage = () => {
  const navigate = useNavigate();
  return (
    <Container fluid className="py-4 messages-page-wrapper">
      <Row>
        <Col xs={12}>
          <h1 className="mb-3">Messagerie</h1>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 1200 }}>
              <MessageBox onClose={() => navigate('/')} />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MessagesPage;
