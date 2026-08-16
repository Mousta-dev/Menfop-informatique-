import React, { useState, useEffect, useRef } from 'react';
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
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
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
    <div className="message-widget">
      <div className="message-panel">
        <div className="message-header">
          <div className="header-left">
            <div className="header-avatar">💬</div>
            <div>
              <div className="header-title">Messagerie</div>
              <div className="header-sub">Client ↔ Admin</div>
            </div>
            {notificationCount > 0 && (
              <div className="header-badge">{notificationCount}</div>
            )}
          </div>
          <div className="header-actions">
            <button className="btn-action" title="Minimiser" onClick={() => window.dispatchEvent(new CustomEvent('toggleChatMinimize'))}>—</button>
            {onClose && <button className="btn-action" title="Fermer" onClick={onClose}>×</button>}
          </div>
        </div>

        <div className="message-body">
          {isAdmin && (
            <div className="message-rooms">
              <div className="rooms-title">Conversations</div>
              <div className="rooms-list">
                {rooms.length === 0 ? (
                  <div className="rooms-empty">Aucune conversation</div>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room.id}
                      className={`room-item ${selectedRoom === room.name ? 'active' : ''}`}
                      onClick={() => setSelectedRoom(room.name)}
                    >
                      <span className="room-initial">{room.name.replace(/^dm:/, '').charAt(0).toUpperCase()}</span>
                      <span className="room-name">{room.name.replace(/^dm:/, '')}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="message-content">
            <div className="conversation-header small text-muted">
              {isAdmin ? `Conversation : ${selectedRoom ? selectedRoom.replace(/^dm:/, '') : 'Aucune'}` : 'Votre conversation client/admin'}
            </div>

            <div className="message-list" role="log" aria-live="polite">
              {messages.length === 0 ? (
                <div className="empty-state">Aucun message pour le moment.</div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_name === username;
                  const canEdit = isMine || isAdmin; // allow edit for own messages and admin
                  const canDelete = isMine || isAdmin; // allow admin to delete
                  return (
                    <div key={m.id} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && <div className="bubble-avatar">{m.sender_name.charAt(0).toUpperCase()}</div>}
                      <div className="bubble-content">
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'}}>
                          <div className="bubble-meta">{m.sender_name} • <span className="time">{new Date(m.created_at).toLocaleTimeString()}</span></div>
                          <div style={{display:'flex', gap:6}}>
                            {canEdit && editId !== m.id && (
                              <button className="btn-action" title="Modifier" onClick={() => { setEditId(m.id); setEditText(m.content); }}>✎</button>
                            )}
                            {canDelete && (
                              <button className="btn-action" title="Supprimer" onClick={async () => {
                                if (!window.confirm('Supprimer ce message ?')) return;
                                try {
                                  await axios.delete(`/api/messages/${m.id}`, { headers });
                                  const res = await axios.get('/api/messages', { params: { room: selectedRoom }, headers });
                                  if (res.data && res.data.data) setMessages(res.data.data);
                                } catch (e) {
                                  console.error(e);
                                  alert('Impossible de supprimer le message');
                                }
                              }}>🗑</button>
                            )}
                          </div>
                        </div>

                        {editId === m.id ? (
                          <div style={{display:'flex', flexDirection:'column', gap:8}}>
                            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                            <div style={{display:'flex', gap:8}}>
                              <button className="btn" onClick={async () => {
                                try {
                                  const trimmed = editText.trim();
                                  if (!trimmed) { alert('Le message ne peut pas être vide'); return; }
                                  await axios.put(`/api/messages/${m.id}`, { content: trimmed }, { headers });
                                  setEditId(null);
                                  setEditText('');
                                  const res = await axios.get('/api/messages', { params: { room: selectedRoom }, headers });
                                  if (res.data && res.data.data) setMessages(res.data.data);
                                } catch (e) {
                                  console.error(e);
                                  alert('Impossible de mettre à jour le message');
                                }
                              }}>Enregistrer</button>
                              <button className="btn" onClick={() => { setEditId(null); setEditText(''); }}>Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div className="bubble-text">{m.content}</div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="message-input" role="search">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={selectedRoom ? 'Tapez un message...' : 'Sélectionnez une conversation...'}
                disabled={!selectedRoom}
                rows={1}
              />
              <button type="submit" className="send-btn" disabled={!selectedRoom || !newMessage.trim()} aria-label="Envoyer">Envoyer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
