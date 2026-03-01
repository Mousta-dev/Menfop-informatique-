require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            console.log(`Accès refusé pour ${req.user ? req.user.username : 'inconnu'}. Rôle requis: ${role}, Rôle actuel: ${req.user ? req.user.role : 'aucun'}`);
            res.status(403).json({ error: "Accès refusé : Droits insuffisants (Rôle " + role + " requis)" });
        }
    };
};

const db = new sqlite3.Database('./management.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'utilisateur'
            )`, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                } else {
                    // Check if role column exists and add if missing (migration)
                    db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'utilisateur'`, (err) => {
                        if (err && !err.message.includes('duplicate column name')) {
                            console.error('Error adding role column:', err.message);
                        }

                        const insertAdmin = 'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)';
                        bcrypt.hash('Mousta@2025', 10, (err, hash) => {
                            if (err) {
                                console.error('Error hashing password for admin:', err);
                            } else {
                                db.run(insertAdmin, ['Alpha', hash, 'administrateur'], (err) => {
                                    if (!err) {
                                        // Ensure existing Alpha is admin and has ID 1 if possible
                                        db.run('UPDATE users SET role = "administrateur" WHERE username = "Alpha"');
                                    }
                                });
                            }
                        });
                    });
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS establishments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )`, (err) => {
                if (err) console.error('Error creating establishments table:', err.message);
            });
            db.run(`CREATE TABLE IF NOT EXISTS equipment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                establishment_id INTEGER,
                FOREIGN KEY (establishment_id) REFERENCES establishments(id)
            )`, (err) => {
                if (err) console.error('Error creating equipment table:', err.message);
            });
            db.run(`CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error('Error creating reports table:', err.message);
            });
            db.run(`CREATE TABLE IF NOT EXISTS missions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error('Error creating missions table:', err.message);
            });
        });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result) {
                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                res.json({ success: true, token, role: user.role });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        });
    });
});

app.get('/api/establishments', authenticateToken, (req, res) => {
    db.all('SELECT * FROM establishments', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/establishments', authenticateToken, (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ "error": "Name is required" });
        return;
    }
    db.run('INSERT INTO establishments (name) VALUES (?)', [name], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, name }
        });
    });
});

app.put('/api/establishments/:id', authenticateToken, (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    if (!name) {
        res.status(400).json({ "error": "Name is required" });
        return;
    }
    db.run('UPDATE establishments SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id, name },
            "changes": this.changes
        });
    });
});

app.delete('/api/establishments/:id', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM establishments WHERE id = ?', id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes
        });
    });
});

app.get('/api/equipment', authenticateToken, (req, res) => {
    const { status, establishment_id } = req.query;
    let sql = 'SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id';
    const params = [];
    const conditions = [];

    if (status) {
        conditions.push('status = ?');
        params.push(status);
    }
    if (establishment_id) {
        conditions.push('establishment_id = ?');
        params.push(establishment_id);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/equipment/damaged', authenticateToken, (req, res) => {
    db.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "damaged"', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/equipment/functional', authenticateToken, (req, res) => {
    db.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "functional"', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/equipment/new', authenticateToken, (req, res) => {
    db.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "new"', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/equipment', authenticateToken, (req, res) => {
    const { name, status, establishment_id } = req.body;
    if (!name || !status || !establishment_id) {
        res.status(400).json({ "error": "Name, status, and establishment_id are required" });
        return;
    }
    db.run('INSERT INTO equipment (name, status, establishment_id) VALUES (?, ?, ?)', [name, status, establishment_id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, name, status, establishment_id }
        });
    });
});

app.put('/api/equipment/:id', authenticateToken, (req, res) => {
    const { name, status, establishment_id } = req.body;
    const { id } = req.params;
    if (!name || !status || !establishment_id) {
        res.status(400).json({ "error": "Name, status, and establishment_id are required" });
        return;
    }
    db.run('UPDATE equipment SET name = ?, status = ?, establishment_id = ? WHERE id = ?', [name, status, establishment_id, id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id, name, status, establishment_id },
            "changes": this.changes
        });
    });
});

app.delete('/api/equipment/:id', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM equipment WHERE id = ?', id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes
        });
    });
});

app.post('/api/reports', authenticateToken, (req, res) => {
    const { content } = req.body;
    if (!content) {
        res.status(400).json({ "error": "Content is required" });
        return;
    }
    db.run('INSERT INTO reports (content) VALUES (?)', [content], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, content }
        });
    });
});

app.get('/api/reports', authenticateToken, (req, res) => {
    db.all('SELECT * FROM reports ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/reports/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM reports WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ "error": "Report not found" });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// Missions API
app.post('/api/missions', authenticateToken, (req, res) => {
    const { name, description, status } = req.body;
    if (!name) {
        res.status(400).json({ "error": "Name is required" });
        return;
    }
    db.run('INSERT INTO missions (name, description, status) VALUES (?, ?, ?)', [name, description, status || 'pending'], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, name, description, status: status || 'pending' }
        });
    });
});

app.get('/api/missions', authenticateToken, (req, res) => {
    db.all('SELECT * FROM missions ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/missions/summary', authenticateToken, (req, res) => {
    db.all('SELECT status, COUNT(*) as count FROM missions GROUP BY status', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/missions/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM missions WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ "error": "Mission not found" });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

app.get('/api/dashboard/summary', authenticateToken, (req, res) => {
    db.get('SELECT COUNT(*) as totalEquipment FROM equipment', (err, total) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        db.all('SELECT status, COUNT(*) as count FROM equipment GROUP BY status', [], (err, statusCounts) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": {
                    totalEquipment: total.totalEquipment,
                    statusCounts: statusCounts
                }
            });
        });
    });
});

app.get('/api/dashboard/equipment-by-establishment', authenticateToken, (req, res) => {
    db.all('SELECT e.name as establishment_name, COUNT(eq.id) as equipmentCount FROM establishments e LEFT JOIN equipment eq ON e.id = eq.establishment_id GROUP BY e.name ORDER BY e.name', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/users', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont requis." });
    }
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: "Erreur technique (hachage)." });
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role || 'utilisateur'], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Ce nom d'utilisateur existe déjà." });
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ message: "Utilisateur créé avec succès", id: this.lastID });
        });
    });
});

app.get('/api/users', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    db.all('SELECT id, username, role FROM users', [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.put('/api/users/:id', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    const { username, role, password } = req.body;
    const { id } = req.params;

    console.log(`Modification de l'utilisateur ID: ${id} par l'admin: ${req.user.username}`);

    if (password && password.trim() !== "") {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: "Erreur de hachage" });
            db.run('UPDATE users SET username = ?, role = ?, password = ? WHERE id = ?', [username, role, hash, id], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "Utilisateur mis à jour avec nouveau mot de passe" });
            });
        });
    } else {
        db.run('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Utilisateur mis à jour" });
        });
    }
});

app.delete('/api/users/:id', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    const { id } = req.params;
    
    // Si req.user.id est manquant dans le token, on se base sur le nom pour la protection
    const isSelf = (req.user.id && String(req.user.id) === String(id)) || (req.user.username === 'Alpha' && id == '1');

    if (isSelf) {
        return res.status(400).json({ error: "Protection : Vous ne pouvez pas supprimer le compte administrateur principal." });
    }

    db.run('DELETE FROM users WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: "Erreur lors de la suppression en base." });
        if (this.changes === 0) return res.status(404).json({ error: "Utilisateur non trouvé." });
        res.json({ message: "Utilisateur supprimé avec succès." });
    });
});

// Fallback routes if prefix is missing
app.get('/users', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    db.all('SELECT id, username, role FROM users', [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.delete('/users/:id', authenticateToken, authorizeRole('administrateur'), (req, res) => {
    const { id } = req.params;
    const isSelf = (req.user.id && String(req.user.id) === String(id)) || (req.user.username === 'Alpha' && id == '1');
    if (isSelf) return res.status(400).json({ error: "Interdit." });
    db.run('DELETE FROM users WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: "Erreur." });
        res.json({ message: "Supprimé." });
    });
});

app.get('/', (req, res) => {
    res.send('Management App Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
