import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './UserChat.css';

const UserChat = ({ token, username }) => {
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // Initialize conversation and load messages
    useEffect(() => {
        const initChat = async () => {
            try {
                // Get or create conversation
                const convRes = await axios.get(`${API_URL}/conversations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConversationId(convRes.data.data.id);
                
                // Load messages
                const msgsRes = await axios.get(`${API_URL}/conversations/${convRes.data.data.id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(msgsRes.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Erreur lors du chargement');
                setLoading(false);
            }
        };
        initChat();
    }, [token, API_URL]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Refresh messages periodically
    useEffect(() => {
        if (!conversationId) return;
        
        const interval = setInterval(async () => {
            try {
                const msgsRes = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(msgsRes.data.data);
            } catch (err) {
                console.error('Erreur lors du rafraîchissement:', err);
            }
        }, 3000); // Refresh every 3 seconds

        return () => clearInterval(interval);
    }, [conversationId, token, API_URL]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId) return;

        try {
            const res = await axios.post(
                `${API_URL}/conversations/${conversationId}/messages`,
                { content: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setMessages([...messages, { ...res.data.data, username }]);
            setNewMessage('');
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
        }
    };

    if (loading) return <div className="user-chat-container"><p>Chargement...</p></div>;

    return (
        <div className="user-chat-container">
            <div className="chat-header">
                <h2>💬 Contactez l'Admin</h2>
                <p>Vous êtes connecté en tant que: <strong>{username}</strong></p>
            </div>

            {error && <div className="chat-error">{error}</div>}

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">Aucun message pour le moment. Commencez une conversation!</div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender_id === Number(sessionStorage.getItem('userId')) ? 'sent' : 'received'}`}>
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
                    placeholder="Écrivez votre message..."
                    maxLength="500"
                />
                <button type="submit" disabled={!newMessage.trim()}>
                    Envoyer
                </button>
            </form>
        </div>
    );
};

export default UserChat;
