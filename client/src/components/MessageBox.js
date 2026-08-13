import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';

const MessageBox = ({ onClose }) => {
  const username = sessionStorage.getItem('username');
  const role = sessionStorage.getItem('role');
  const isAdmin = role === 'administrateur';
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(isAdmin ? '' : `dm:${username}`);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const messagesEndRef = useRef(null);
  const token = sessionStorage.getItem('token');
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms', { headers });
      if (res.data && res.data.data) {
        const directRooms = res.data.data.filter(
          (room) => room && typeof room.name === 'string' && room.name.startsWith('dm:')
        );
        setRooms(directRooms);
        if (isAdmin && !selectedRoom && directRooms.length > 0) {
          setSelectedRoom(directRooms[0].name);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/notifications', { headers });
      if (res.data && res.data.data) {
        setNotificationCount(res.data.data.filter((n) => !n.read).length);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (isAdmin) fetchRooms();
    fetchNotifications();
  }, [isAdmin, token]);

  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get('/api/messages', { params: { room: selectedRoom }, headers });
        if (res.data && res.data.data) setMessages(res.data.data);
      } catch (e) {
        // ignore
      }
    };

    fetchMessages();
  }, [selectedRoom, token]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAdmin) fetchRooms();
      fetchNotifications();
      if (selectedRoom) {
        axios.get('/api/messages', { params: { room: selectedRoom }, headers })
          .then((res) => res.data && res.data.data && setMessages(res.data.data))
          .catch(() => {});
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isAdmin, selectedRoom, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    if (event) event.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      await axios.post('/api/messages', { room: selectedRoom, content: newMessage.trim() }, { headers });
      setNewMessage('');
      const res = await axios.get('/api/messages', { params: { room: selectedRoom }, headers });
      if (res.data && res.data.data) setMessages(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="d-flex justify-content-between align-items-center px-3 py-2" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)', color: '#fff', borderBottom: 'none' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold">Messagerie</span>
          {notificationCount > 0 && (
            <span className="badge rounded-pill bg-light text-primary">{notificationCount}</span>
          )}
        </div>
        {onClose && (
          <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={onClose} aria-label="Fermer" style={{ width: 28, height: 28, padding: 0, lineHeight: '28px' }}>
            ×
          </button>
        )}
      </Card.Header>
      <Card.Body className="p-0">
        <div className="d-flex gap-3 p-3" style={{ minHeight: 360, flexWrap: 'wrap' }}>
          {isAdmin && (
            <div style={{ width: 220 }}>
              <ListGroup>
                {rooms.length === 0 ? (
                  <ListGroup.Item variant="light" className="text-muted">Aucune conversation</ListGroup.Item>
                ) : (
                  rooms.map((room) => (
                    <ListGroup.Item
                      key={room.id}
                      active={selectedRoom === room.name}
                      action
                      onClick={() => setSelectedRoom(room.name)}
                    >
                      {room.name.replace(/^dm:/, '')}
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </div>
          )}

          <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 360, maxHeight: 480, minWidth: 0 }}>
            <div className="small text-muted mb-2">
              {isAdmin ? `Conversation: ${selectedRoom ? selectedRoom.replace(/^dm:/, '') : 'Aucune'}` : 'Votre conversation client/admin'}
            </div>
            <div className="overflow-auto mb-2 border rounded" style={{ flex: 1, background: '#f8f9fa' }}>
              <ListGroup variant="flush">
                {messages.length === 0 ? (
                  <ListGroup.Item className="text-muted text-center py-4">Aucun message pour le moment.</ListGroup.Item>
                ) : (
                  messages.map((m) => (
                    <ListGroup.Item
                      key={m.id}
                      className={m.sender_name === username ? 'text-end bg-white' : 'bg-transparent'}
                    >
                      <div className="small text-muted">{m.sender_name} • {new Date(m.created_at).toLocaleString()}</div>
                      <div>{m.content}</div>
                    </ListGroup.Item>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ListGroup>
            </div>

            <Form onSubmit={handleSend} className="mt-2 d-flex gap-2">
              <Form.Control
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Votre message..."
                disabled={!selectedRoom}
              />
              <Button type="submit" disabled={!selectedRoom || !newMessage.trim()}>Envoyer</Button>
            </Form>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MessageBox;
