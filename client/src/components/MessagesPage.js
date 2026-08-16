import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MessageBox from './MessageBox';

const MessagesPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col xs={12}>
          <h1 className="mb-3">Messagerie</h1>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 980 }}>
              <MessageBox />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MessagesPage;
