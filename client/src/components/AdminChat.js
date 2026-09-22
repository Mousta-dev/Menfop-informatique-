import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import './AdminChat.css';

const AdminChat = ({ token }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // Load all conversations
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const res = await api.get('/conversations/admin/all');
                setConversations(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Erreur lors du chargement');
                setLoading(false);
            }
        };
        loadConversations();
    }, []);

    // Refresh conversations periodically
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get('/conversations/admin/all');
                setConversations(res.data.data);
            } catch (err) {
                console.error('Erreur:', err);
            }
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Load messages when conversation is selected
    useEffect(() => {
        if (!selectedConvId) return;

        const loadMessages = async () => {
            try {
                const res = await api.get(`/conversations/${selectedConvId}/messages`);
                setMessages(res.data.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Erreur lors du chargement');
            }
        };
        loadMessages();

        // Refresh messages periodically
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedConvId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConvId) return;

        try {
            const res = await api.post(
                `/conversations/${selectedConvId}/messages`,
                { content: newMessage }
            );
            
            setMessages([...messages, res.data.data]);
            setNewMessage('');
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
        }
    };

    if (loading) return <div className="admin-chat-container"><p>Chargement...</p></div>;

    return (
        <div className="admin-chat-layout">
            <div className="conversations-panel">
                <div className="panel-header">
                    <h2>📬 Conversations</h2>
                    <span className="conv-count">{conversations.length}</span>
                </div>

                {error && <div className="chat-error">{error}</div>}

                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <p className="no-convs">Aucune conversation</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${selectedConvId === conv.id ? 'active' : ''}`}
                                onClick={() => setSelectedConvId(conv.id)}
                            >
                                <div className="conv-info">
                                    <strong>{conv.username || 'Utilisateur'}</strong>
                                    <small>{conv.email || 'N/A'}</small>
                                    <div className="conv-time">
                                        {new Date(conv.updated_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="messages-panel">
                {selectedConvId ? (
                    <>
                        <div className="chat-header">
                            <h2>💬 Conversation</h2>
                            <p>ID: {selectedConvId}</p>
                        </div>

                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="no-messages">Aucun message dans cette conversation</div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.username === 'Alpha' ? 'admin' : 'user'}`}>
                                        <strong>{msg.username}:</strong>
                                        <p>{msg.content}</p>
                                        <small>{new Date(msg.created_at).toLocaleString()}</small>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="message-form">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Écrivez votre réponse..."
                                maxLength="500"
                            />
                            <button type="submit" disabled={!newMessage.trim()}>
                                Envoyer
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-selection">
                        <p>Sélectionnez une conversation pour commencer</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
