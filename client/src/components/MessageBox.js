import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const MessageBox = ({ onClose }) => {
  const username = sessionStorage.getItem('username');
  const isAdmin = sessionStorage.getItem('role') === 'administrateur';
  const token = sessionStorage.getItem('token');
  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(isAdmin ? '' : `dm:${username}`);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const knownNotificationIds = useRef(new Set());
  const notificationsInitialized = useRef(false);

  const fetchRooms = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get('/api/rooms', { headers });
      const directRooms = (res.data?.data || []).filter(
        (room) => room && typeof room.name === 'string' && room.name.startsWith('dm:')
      );
      setRooms(directRooms);
      setSelectedRoom((currentRoom) => (
        currentRoom && directRooms.some((room) => room.name === currentRoom)
          ? currentRoom
          : directRooms[0]?.name || ''
      ));
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Impossible de charger les conversations.');
    }
  }, [headers, isAdmin]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/notifications', { headers });
      const nextNotifications = res.data?.data || [];
      if (notificationsInitialized.current && window.Notification?.permission === 'granted') {
        nextNotifications.forEach((notification) => {
          if (!notification.read && !knownNotificationIds.current.has(String(notification.id))) {
            new window.Notification('Nouveau message', { body: notification.message });
          }
        });
      }
      knownNotificationIds.current = new Set(nextNotifications.map((notification) => String(notification.id)));
      notificationsInitialized.current = true;
      setNotifications(nextNotifications);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Impossible de charger les notifications.');
    }
  }, [headers, token]);

  const fetchMessages = useCallback(async (room) => {
    if (!room) {
      setMessages([]);
      return;
    }
    try {
      const res = await axios.get('/api/messages', { params: { room }, headers });
      const nextMessages = res.data?.data || [];
      setMessages((currentMessages) => {
        const unchanged = currentMessages.length === nextMessages.length
          && currentMessages.every((message, index) => (
            String(message.id) === String(nextMessages[index].id)
            && message.content === nextMessages[index].content
          ));
        return unchanged ? currentMessages : nextMessages;
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Impossible de charger les messages.');
    }
  }, [headers]);

  const markRoomRead = useCallback(async (room) => {
    if (!room) return;
    try {
      await axios.post('/api/notifications/read-room', { room }, { headers });
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Impossible de mettre à jour les notifications.');
    }
  }, [headers]);

  useEffect(() => {
    fetchRooms();
    fetchNotifications();
  }, [fetchNotifications, fetchRooms]);

  useEffect(() => {
    if (!selectedRoom) return;
    setMessages([]);
    shouldAutoScroll.current = true;
    fetchMessages(selectedRoom);
    markRoomRead(selectedRoom).then(fetchNotifications);
  }, [fetchMessages, fetchNotifications, markRoomRead, selectedRoom]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      await fetchRooms();
      if (selectedRoom) {
        await fetchMessages(selectedRoom);
        await markRoomRead(selectedRoom);
      }
      await fetchNotifications();
    }, 4000);
    return () => window.clearInterval(intervalId);
  }, [fetchMessages, fetchNotifications, fetchRooms, markRoomRead, selectedRoom]);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const handleSend = async (event) => {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedRoom || isSending) return;

    setIsSending(true);
    shouldAutoScroll.current = true;
    setErrorMessage('');
    try {
      await axios.post('/api/messages', { room: selectedRoom, content }, { headers });
      setNewMessage('');
      await Promise.all([fetchMessages(selectedRoom), fetchRooms(), fetchNotifications()]);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Impossible d'envoyer le message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (message) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await axios.delete(`/api/messages/${message.id}`, { headers });
      await fetchMessages(selectedRoom);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Impossible de supprimer le message.');
    }
  };

  const handleEdit = async (message) => {
    const content = editText.trim();
    if (!content) {
      setErrorMessage('Le message ne peut pas être vide.');
      return;
    }
    try {
      await axios.put(`/api/messages/${message.id}`, { content }, { headers });
      setEditId(null);
      setEditText('');
      await fetchMessages(selectedRoom);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Impossible de modifier le message.');
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.room) {
        setSelectedRoom(notification.room);
        await markRoomRead(notification.room);
      } else {
        await axios.post(`/api/notifications/${notification.id}/read`, {}, { headers });
      }
      await fetchNotifications();
      setNotificationOpen(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Impossible de mettre à jour la notification.');
    }
  };

  const enableDesktopNotifications = async () => {
    if (!('Notification' in window)) {
      setErrorMessage('Les notifications du navigateur ne sont pas disponibles.');
      return;
    }
    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') {
      setErrorMessage("L'autorisation des notifications a été refusée.");
    }
  };

  return (
    <div className="message-widget">
      <div className={`message-panel ${minimized ? 'minimized' : ''}`}>
        <div className="message-header">
          <div className="header-left">
            <div className="header-avatar" aria-hidden="true">💬</div>
            <div>
              <div className="header-title">Messagerie</div>
              <div className="header-sub">Client ↔ Admin · actualisation automatique</div>
            </div>
            <button
              type="button"
              className="header-badge"
              aria-label={`${unreadNotifications.length} notification(s) non lue(s)`}
              aria-expanded={notificationOpen}
              onClick={() => setNotificationOpen((isOpen) => !isOpen)}
            >
              {unreadNotifications.length}
            </button>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn-action"
              title={minimized ? 'Restaurer' : 'Réduire'}
              aria-label={minimized ? 'Restaurer la messagerie' : 'Réduire la messagerie'}
              aria-expanded={!minimized}
              onClick={() => setMinimized((value) => !value)}
            >
              {minimized ? '+' : '—'}
            </button>
            {onClose && <button type="button" className="btn-action" title="Fermer" onClick={onClose}>×</button>}
          </div>
        </div>

        {notificationOpen && (
          <section className="message-notifications" aria-label="Notifications de messagerie">
            <div className="message-notifications-heading">
              <strong>Notifications</strong>
              {'Notification' in window && window.Notification.permission !== 'granted' && (
                <button type="button" onClick={enableDesktopNotifications}>Activer sur cet appareil</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="message-notifications-empty">Aucune notification.</p>
            ) : (
              <div className="message-notifications-list">
                {notifications.slice(0, 20).map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    className={`message-notification ${notification.read ? '' : 'unread'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span>{notification.message}</span>
                    <small>{new Date(notification.created_at).toLocaleString()}</small>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {!minimized && (
          <div className="message-body">
            {isAdmin && (
              <aside className="message-rooms">
                <div className="rooms-title">Conversations</div>
                <div className="rooms-list">
                  {rooms.length === 0 ? (
                    <div className="rooms-empty">Aucune conversation</div>
                  ) : rooms.map((room) => {
                    const roomUnread = unreadNotifications.filter((notification) => notification.room === room.name).length;
                    return (
                      <button
                        type="button"
                        key={room.id}
                        className={`room-item ${selectedRoom === room.name ? 'active' : ''}`}
                        onClick={() => setSelectedRoom(room.name)}
                      >
                        <span className="room-initial">{room.name.replace(/^dm:/, '').charAt(0).toUpperCase()}</span>
                        <span className="room-name">{room.name.replace(/^dm:/, '')}</span>
                        {roomUnread > 0 && <span className="room-unread">{roomUnread}</span>}
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}

            <div className="message-content">
              <div className="conversation-header small text-muted">
                {isAdmin
                  ? `Conversation : ${selectedRoom ? selectedRoom.replace(/^dm:/, '') : 'Aucune'}`
                  : 'Votre conversation client/admin'}
              </div>
              {errorMessage && <div className="message-error" role="alert">{errorMessage}</div>}

              <div
                className="message-list"
                role="log"
                aria-live="polite"
                onScroll={(event) => {
                  const element = event.currentTarget;
                  shouldAutoScroll.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
                }}
              >
                {!selectedRoom ? (
                  <div className="empty-state">Sélectionnez une conversation pour commencer.</div>
                ) : messages.length === 0 ? (
                  <div className="empty-state">Aucun message pour le moment. Écrivez le premier message.</div>
                ) : messages.map((message) => {
                  const isMine = message.sender_name === username;
                  const canManage = isAdmin || isMine;
                  return (
                    <div key={message.id} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && <div className="bubble-avatar">{message.sender_name?.charAt(0).toUpperCase() || '?'}</div>}
                      <div className="bubble-content">
                        <div className="bubble-message-heading">
                          <div className="bubble-meta">
                            {message.sender_name} · <span className="time">{new Date(message.created_at).toLocaleTimeString()}</span>
                          </div>
                          {canManage && (
                            <div className="bubble-actions">
                              {editId !== message.id && (
                                <button
                                  type="button"
                                  className="btn-action"
                                  title="Modifier"
                                  aria-label="Modifier ce message"
                                  onClick={() => { setEditId(message.id); setEditText(message.content); }}
                                >✎</button>
                              )}
                              <button
                                type="button"
                                className="btn-action"
                                title="Supprimer"
                                aria-label="Supprimer ce message"
                                onClick={() => handleDelete(message)}
                              >🗑</button>
                            </div>
                          )}
                        </div>
                        {editId === message.id ? (
                          <div className="message-edit">
                            <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={3} />
                            <div>
                              <button type="button" className="send-btn" onClick={() => handleEdit(message)}>Enregistrer</button>
                              <button type="button" className="message-cancel-btn" onClick={() => { setEditId(null); setEditText(''); }}>Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div className="bubble-text">{message.content}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="message-input">
                <textarea
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend(event);
                    }
                  }}
                  placeholder={selectedRoom ? 'Tapez un message...' : 'Sélectionnez une conversation...'}
                  disabled={!selectedRoom || isSending}
                  rows={1}
                  aria-label="Votre message"
                />
                <button type="submit" className="send-btn" disabled={!selectedRoom || !newMessage.trim() || isSending}>
                  {isSending ? 'Envoi…' : 'Envoyer'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
