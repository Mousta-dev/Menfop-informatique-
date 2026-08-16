require('dotenv').config();
const express = require('express');
const { sql } = require('@vercel/postgres');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const usePostgres = !!process.env.POSTGRES_URL;

// --- Database Connection ---
let dbSQLite;
if (!usePostgres) {
    const dbPath = path.join(__dirname, 'management.db');
    dbSQLite = new sqlite3.Database(dbPath);
    console.log('Using local SQLite database.');
} else {
    console.log('Using Vercel Postgres database.');
}

// Ensure database tables exist before any request
let tablesEnsured = false;
const ensureTables = async () => {
    if (tablesEnsured) return;
    
    if (usePostgres) {
        try {
            // Run table creations individually for better reliability
            await sql`CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, 
                username TEXT, 
                password TEXT NOT NULL, 
                role TEXT DEFAULT 'utilisateur'
            )`;
            
            // Add columns individually
            try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`; } catch (e) { console.log('Email column check error:', e.message); }
            try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`; } catch (e) { console.log('Phone column check error:', e.message); }
            
            // Ensure constraints/indexes
            try { await sql`ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)`; } catch (e) {}
            try { await sql`ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone)`; } catch (e) {}
            try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email)`; } catch (e) {}
            try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_phone_idx ON users(phone)`; } catch (e) {}

            await sql`CREATE TABLE IF NOT EXISTS establishments (id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE)`;
            await sql`CREATE TABLE IF NOT EXISTS equipment (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, establishment_id INTEGER REFERENCES establishments(id))`;
            await sql`CREATE TABLE IF NOT EXISTS reports (id SERIAL PRIMARY KEY, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            await sql`CREATE TABLE IF NOT EXISTS missions (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            await sql`CREATE TABLE IF NOT EXISTS interventions (id SERIAL PRIMARY KEY, mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE, equipment_id INTEGER REFERENCES equipment(id), equipment_name TEXT, description TEXT, result TEXT)`;

            // Messaging / Notifications
            await sql`CREATE TABLE IF NOT EXISTS rooms (id SERIAL PRIMARY KEY, name TEXT UNIQUE, is_group BOOLEAN DEFAULT FALSE)`;
            await sql`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, room TEXT, sender_id INTEGER, sender_name TEXT, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            await sql`CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, target TEXT, role TEXT, message TEXT, read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            
            // Try to add equipment_name column if it doesn't exist
            try {
                await sql`ALTER TABLE interventions ADD COLUMN IF NOT EXISTS equipment_name TEXT`;
            } catch (alterErr) {
                console.log('Interventions column check error:', alterErr.message);
            }
            
            // Seed Admin Alpha
            const hash = await bcrypt.hash('Mousta@2025', 10);
            const existingAdmin = await sql`SELECT * FROM users WHERE username = 'Alpha' OR email = 'admin@menfop.com'`;
            if (existingAdmin.rows.length === 0) {
                await sql`INSERT INTO users (username, email, password, role) VALUES ('Alpha', 'admin@menfop.com', ${hash}, 'administrateur')`;
                console.log('Seed: Admin Alpha created in Postgres.');
            } else {
                // Ensure Alpha has the right role and email if already exists
                await sql`UPDATE users SET email = 'admin@menfop.com', role = 'administrateur' WHERE username = 'Alpha' AND (email IS NULL OR role != 'administrateur')`;
            }
            tablesEnsured = true;
        } catch (err) {
            console.error('Postgres init error detail:', err);
            // Re-throw to be caught by the middleware and show 500
            throw err;
        }
    } else {
        return new Promise((resolve, reject) => {
            dbSQLite.serialize(() => {
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    username TEXT, 
                    email TEXT UNIQUE,
                    phone TEXT UNIQUE,
                    password TEXT NOT NULL, 
                    role TEXT DEFAULT 'utilisateur'
                )`);
                
                // Try to add email and phone columns for existing SQLite tables
                dbSQLite.run(`ALTER TABLE users ADD COLUMN email TEXT`, (err) => {});
                dbSQLite.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (err) => {});

                dbSQLite.run(`CREATE TABLE IF NOT EXISTS establishments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`);
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS equipment (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, status TEXT NOT NULL, establishment_id INTEGER, FOREIGN KEY (establishment_id) REFERENCES establishments(id))`);
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS missions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS interventions (id INTEGER PRIMARY KEY AUTOINCREMENT, mission_id INTEGER, equipment_id INTEGER, equipment_name TEXT, description TEXT, result TEXT, FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE, FOREIGN KEY (equipment_id) REFERENCES equipment(id))`);

                // Messaging / Notifications
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, is_group INTEGER DEFAULT 0)`);
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT, sender_id INTEGER, sender_name TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
                dbSQLite.run(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT, role TEXT, message TEXT, read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
                
                // Try to add equipment_name column if it doesn't exist (for existing tables)
                dbSQLite.run(`ALTER TABLE interventions ADD COLUMN equipment_name TEXT`, (err) => {});
                
                dbSQLite.get('SELECT * FROM users WHERE username = ? OR email = ?', ['Alpha', 'admin@menfop.com'], (err, row) => {
                    if (!err && !row) {
                        bcrypt.hash('Mousta@2025', 10, (err, hash) => {
                            if (!err) dbSQLite.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', ['Alpha', 'admin@menfop.com', hash, 'administrateur'], () => {
                                tablesEnsured = true;
                                resolve();
                            });
                            else resolve();
                        });
                    } else {
                        tablesEnsured = true;
                        resolve();
                    }
                });
            });
        });
    }
};

// --- Middleware to ensure tables are ready ---
app.use(async (req, res, next) => {
    if (tablesEnsured) return next();
    try {
        await ensureTables();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database initialization failed" });
    }
});

app.get('/api/migrate-db', async (req, res) => {
    try {
        if (usePostgres) {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`;
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`;
            try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email)`; } catch(e) {}
            try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_phone_idx ON users(phone)`; } catch(e) {}
            
            const hash = await require('bcryptjs').hash('Mousta@2025', 10);
            const check = await sql`SELECT * FROM users WHERE username = 'Alpha'`;
            if (check.rows.length > 0) {
                await sql`UPDATE users SET email = 'admin@menfop.com', password = ${hash}, role = 'administrateur' WHERE username = 'Alpha'`;
            } else {
                await sql`INSERT INTO users (username, email, password, role) VALUES ('Alpha', 'admin@menfop.com', ${hash}, 'administrateur')`;
            }
            res.json({ success: true, message: "Postgres migration completed." });
        } else {
            res.json({ success: true, message: "SQLite used, no remote migration needed." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) next();
        else res.status(403).json({ error: "Accès refusé" });
    };
};

// --- API Routes ---

app.post('/api/login', async (req, res) => {
    let { username, password } = req.body;
    if (username) username = username.trim();
    if (password) password = password.trim();
    try {
        let user;
        if (usePostgres) {
            try {
                // Try to search by username, email, phone or admin alias
                const result = await sql`SELECT * FROM users WHERE LOWER(username) = LOWER(${username}) OR LOWER(email) = LOWER(${username}) OR phone = ${username} OR (${username} = 'admin' AND username = 'Alpha')`;
                user = result.rows[0];
            } catch (err) {
                // Absolute fallback if columns are missing
                const result = await sql`SELECT * FROM users WHERE LOWER(username) = LOWER(${username})`;
                user = result.rows[0];
            }
        } else {
            try {
                user = await new Promise((res, rej) => dbSQLite.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) OR phone = ? OR (? = "admin" AND username = "Alpha")', [username, username, username, username], (err, r) => err ? rej(err) : res(r)));
            } catch (err) {
                user = await new Promise((res, rej) => dbSQLite.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username], (err, r) => err ? rej(err) : res(r)));
            }
        }

        if (!user) return res.json({ success: false, message: 'Identifiants invalides' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
            const displayName = user.username || user.email || user.phone;
            const token = jwt.sign({ id: user.id, username: displayName, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
            res.json({ success: true, token, role: user.role, username: displayName });
        } else {
            res.json({ success: false, message: 'Identifiants invalides' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Public Registration Route ---
app.post('/api/register', async (req, res) => {
    let { username, email, phone, password } = req.body;
    if (username) username = username.trim();
    if (email) email = email.trim();
    if (phone) phone = phone.trim();
    if (password) password = password.trim();

    if (!username || !password) {
        return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis." });
    }

    if (phone && !/^\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Le numéro de téléphone doit comporter 8 chiffres." });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const role = 'utilisateur'; // Always 'utilisateur' for self-registration

        if (usePostgres) {
            // Check if username/email/phone already exists
            const existing = await sql`SELECT * FROM users WHERE username = ${username} OR email = ${email} OR phone = ${phone}`;
            if (existing.rows.length > 0) return res.status(400).json({ error: "Cet utilisateur, email ou numéro existe déjà." });

            const result = await sql`INSERT INTO users (username, email, phone, password, role) VALUES (${username}, ${email}, ${phone}, ${hash}, ${role}) RETURNING id`;
            res.status(201).json({ success: true, id: result.rows[0].id });
        } else {
            dbSQLite.run('INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', [username, email, phone, hash, role], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Cet utilisateur, email ou numéro existe déjà." });
                    return res.status(400).json({ error: err.message });
                }
                res.status(201).json({ success: true, id: this.lastID });
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/establishments', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT * FROM establishments ORDER BY name`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT * FROM establishments ORDER BY name', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/establishments', authenticateToken, async (req, res) => {
    const { name } = req.body;
    try {
        if (usePostgres) {
            const result = await sql`INSERT INTO establishments (name) VALUES (${name}) RETURNING id`;
            res.status(201).json({ message: "success", data: { id: result.rows[0].id, name } });
        } else {
            dbSQLite.run('INSERT INTO establishments (name) VALUES (?)', [name], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.status(201).json({ message: "success", data: { id: this.lastID, name } });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/establishments/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        if (usePostgres) {
            await sql`UPDATE establishments SET name = ${name} WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('UPDATE establishments SET name = ? WHERE id = ?', [name, id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Établissement mis à jour avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/establishments/:id', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { id } = req.params;
    try {
        if (usePostgres) {
            await sql`DELETE FROM establishments WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('DELETE FROM establishments WHERE id = ?', [id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Établissement supprimé avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/equipment', authenticateToken, async (req, res) => {
    const { status, establishment_id } = req.query;
    try {
        let rows;
        if (usePostgres) {
            if (status && establishment_id) rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id WHERE e.status = ${status} AND e.establishment_id = ${establishment_id}`).rows;
            else if (status) rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id WHERE e.status = ${status}`).rows;
            else if (establishment_id) rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id WHERE e.establishment_id = ${establishment_id}`).rows;
            else rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id`).rows;
        } else {
            let q = 'SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id';
            let p = [];
            if (status) { q += ' WHERE status = ?'; p.push(status); }
            rows = await new Promise((res, rej) => dbSQLite.all(q, p, (err, r) => err ? rej(err) : res(r)));
        }
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/equipment/damaged', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id WHERE e.status = 'damaged'`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "damaged"', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/equipment/functional', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id WHERE e.status = 'functional'`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "functional"', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/equipment/repaired', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id WHERE e.status = 'repaired'`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "repaired"', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/equipment', authenticateToken, async (req, res) => {
    const { name, status, establishment_id } = req.body;
    try {
        if (usePostgres) {
            const result = await sql`INSERT INTO equipment (name, status, establishment_id) VALUES (${name}, ${status}, ${establishment_id}) RETURNING id`;
            res.status(201).json({ message: "success", data: { id: result.rows[0].id, name, status, establishment_id } });
        } else {
            dbSQLite.run('INSERT INTO equipment (name, status, establishment_id) VALUES (?, ?, ?)', [name, status, establishment_id], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.status(201).json({ message: "success", data: { id: this.lastID, name, status, establishment_id } });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/equipment/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, status, establishment_id } = req.body;
    try {
        if (usePostgres) {
            await sql`UPDATE equipment SET name = ${name}, status = ${status}, establishment_id = ${establishment_id} WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('UPDATE equipment SET name = ?, status = ?, establishment_id = ? WHERE id = ?', [name, status, establishment_id, id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Équipement mis à jour avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/equipment/:id', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { id } = req.params;
    try {
        if (usePostgres) {
            await sql`DELETE FROM equipment WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('DELETE FROM equipment WHERE id = ?', [id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Équipement supprimé avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT * FROM reports ORDER BY created_at DESC`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT * FROM reports ORDER BY created_at DESC', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/reports', authenticateToken, async (req, res) => {
    const { content } = req.body;
    try {
        if (usePostgres) {
            const result = await sql`INSERT INTO reports (content) VALUES (${content}) RETURNING id`;
            res.status(201).json({ message: "success", data: { id: result.rows[0].id, content } });
        } else {
            dbSQLite.run('INSERT INTO reports (content) VALUES (?)', [content], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.status(201).json({ message: "success", data: { id: this.lastID, content } });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/reports/:id', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { id } = req.params;
    try {
        if (usePostgres) {
            await sql`DELETE FROM reports WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('DELETE FROM reports WHERE id = ?', [id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Rapport supprimé avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/reports/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        let row;
        if (usePostgres) {
            const result = await sql`SELECT * FROM reports WHERE id = ${id}`;
            row = result.rows[0];
        } else {
            row = await new Promise((res, rej) => dbSQLite.get('SELECT * FROM reports WHERE id = ?', [id], (err, r) => err ? rej(err) : res(r)));
        }
        if (row) res.json({ message: "success", data: row });
        else res.status(404).json({ error: "Rapport non trouvé" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/missions', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT * FROM missions ORDER BY created_at DESC`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT * FROM missions ORDER BY created_at DESC', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/missions/summary', authenticateToken, async (req, res) => {
    try {
        if (usePostgres) {
            const total = (await sql`SELECT COUNT(*) as count FROM missions`).rows[0].count;
            const statusCounts = (await sql`SELECT status, COUNT(*) as count FROM missions GROUP BY status`).rows;
            res.json({ message: "success", data: { 
                totalMissions: parseInt(total) || 0, 
                statusCounts: statusCounts.map(s => ({ ...s, count: parseInt(s.count) }))
            } });
        } else {
            dbSQLite.get('SELECT COUNT(*) as totalMissions FROM missions', (err, total) => {
                dbSQLite.all('SELECT status, COUNT(*) as count FROM missions GROUP BY status', [], (err, statusCounts) => {
                    res.json({ message: "success", data: { totalMissions: total ? total.totalMissions : 0, statusCounts: statusCounts || [] } });
                });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/missions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        let row;
        let interventions = [];
        if (usePostgres) {
            const result = await sql`SELECT * FROM missions WHERE id = ${id}`;
            row = result.rows[0];
            if (row) {
                const intRes = await sql`SELECT i.*, COALESCE(e.name, i.equipment_name) as equipment_name FROM interventions i LEFT JOIN equipment e ON i.equipment_id = e.id WHERE i.mission_id = ${id}`;
                interventions = intRes.rows;
            }
        } else {
            row = await new Promise((res, rej) => dbSQLite.get('SELECT * FROM missions WHERE id = ?', [id], (err, r) => err ? rej(err) : res(r)));
            if (row) {
                interventions = await new Promise((res, rej) => dbSQLite.all('SELECT i.*, COALESCE(e.name, i.equipment_name) as equipment_name FROM interventions i LEFT JOIN equipment e ON i.equipment_id = e.id WHERE i.mission_id = ?', [id], (err, r) => err ? rej(err) : res(r)));
            }
        }
        if (row) {
            row.interventions = interventions;
            res.json({ message: "success", data: row });
        }
        else res.status(404).json({ error: "Mission non trouvée" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/missions', authenticateToken, async (req, res) => {
    const { name, description, status, interventions } = req.body;
    try {
        if (usePostgres) {
            const result = await sql`INSERT INTO missions (name, description, status) VALUES (${name}, ${description}, ${status || 'pending'}) RETURNING id`;
            const missionId = result.rows[0].id;
            
            if (interventions && Array.isArray(interventions)) {
                for (const inter of interventions) {
                    await sql`INSERT INTO interventions (mission_id, equipment_id, equipment_name, description, result) VALUES (${missionId}, ${inter.equipment_id || null}, ${inter.equipment_name || null}, ${inter.description}, ${inter.result})`;
                }
            }
            res.status(201).json({ message: "success", data: { id: missionId, name, description, status: status || 'pending' } });
        } else {
            dbSQLite.serialize(() => {
                dbSQLite.run('BEGIN TRANSACTION');
                dbSQLite.run('INSERT INTO missions (name, description, status) VALUES (?, ?, ?)', [name, description, status || 'pending'], function(err) {
                    if (err) {
                        dbSQLite.run('ROLLBACK');
                        return res.status(400).json({ error: err.message });
                    }
                    const missionId = this.lastID;
                    
                    if (interventions && Array.isArray(interventions)) {
                        const stmt = dbSQLite.prepare('INSERT INTO interventions (mission_id, equipment_id, equipment_name, description, result) VALUES (?, ?, ?, ?, ?)');
                        interventions.forEach(inter => {
                            stmt.run(missionId, inter.equipment_id || null, inter.equipment_name || null, inter.description, inter.result);
                        });
                        stmt.finalize();
                    }
                    
                    dbSQLite.run('COMMIT', (err) => {
                        if (err) return res.status(400).json({ error: err.message });
                        res.status(201).json({ message: "success", data: { id: missionId, name, description, status: status || 'pending' } });
                    });
                });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/missions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    try {
        if (usePostgres) {
            await sql`UPDATE missions SET name = ${name}, description = ${description}, status = ${status} WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('UPDATE missions SET name = ?, description = ?, status = ? WHERE id = ?', [name, description, status, id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Mission mise à jour avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/missions/:id', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { id } = req.params;
    try {
        if (usePostgres) {
            await sql`DELETE FROM missions WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('DELETE FROM missions WHERE id = ?', [id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Mission supprimée avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/dashboard/summary', authenticateToken, async (req, res) => {
    try {
        if (usePostgres) {
            const total = (await sql`SELECT COUNT(*) as count FROM equipment`).rows[0].count;
            const statusCounts = (await sql`SELECT status, COUNT(*) as count FROM equipment GROUP BY status`).rows;
            res.json({ message: "success", data: { 
                totalEquipment: parseInt(total) || 0, 
                statusCounts: statusCounts.map(s => ({ ...s, count: parseInt(s.count) }))
            } });
        } else {
            dbSQLite.get('SELECT COUNT(*) as totalEquipment FROM equipment', (err, total) => {
                dbSQLite.all('SELECT status, COUNT(*) as count FROM equipment GROUP BY status', [], (err, statusCounts) => {
                    res.json({ message: "success", data: { totalEquipment: total ? total.totalEquipment : 0, statusCounts: statusCounts || [] } });
                });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/dashboard/equipment-by-establishment', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) {
            rows = (await sql`SELECT e.name as establishment_name, COUNT(eq.id) as equipmentcount FROM establishments e LEFT JOIN equipment eq ON e.id = eq.establishment_id GROUP BY e.name ORDER BY e.name`).rows;
            rows = rows.map(r => ({ establishment_name: r.establishment_name, equipmentCount: parseInt(r.equipmentcount) }));
        } else {
            rows = await new Promise((res, rej) => dbSQLite.all('SELECT e.name as establishment_name, COUNT(eq.id) as equipmentCount FROM establishments e LEFT JOIN equipment eq ON e.id = eq.establishment_id GROUP BY e.name ORDER BY e.name', [], (err, r) => err ? rej(err) : res(r)));
        }
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/users', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT id, username, email, phone, role FROM users`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT id, username, email, phone, role FROM users', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/users', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    let { username, email, phone, password, role } = req.body;
    if (username) username = username.trim();
    if (email) email = email.trim();
    if (phone) phone = phone.trim();
    if (password) password = password.trim();

    if (phone && !/^\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Le numéro de téléphone doit comporter exactement 8 chiffres." });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        if (usePostgres) {
            const result = await sql`INSERT INTO users (username, email, phone, password, role) VALUES (${username}, ${email}, ${phone}, ${hash}, ${role || 'utilisateur'}) RETURNING id`;
            res.status(201).json({ message: "success", id: result.rows[0].id });
        } else {
            dbSQLite.run('INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', [username, email, phone, hash, role || 'utilisateur'], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.status(201).json({ message: "success", id: this.lastID });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/users/:id', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { id } = req.params;
    let { username, email, phone, password, role } = req.body;
    if (username) username = username.trim();
    if (email) email = email.trim();
    if (phone) phone = phone.trim();
    if (password) password = password.trim();

    if (phone && !/^\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Le numéro de téléphone doit comporter exactement 8 chiffres." });
    }

    try {
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            if (usePostgres) {
                await sql`UPDATE users SET username = ${username}, email = ${email}, phone = ${phone}, password = ${hash}, role = ${role} WHERE id = ${id}`;
            } else {
                await new Promise((res, rej) => dbSQLite.run('UPDATE users SET username = ?, email = ?, phone = ?, password = ?, role = ? WHERE id = ?', [username, email, phone, hash, role, id], (err) => err ? rej(err) : res()));
            }
        } else {
            if (usePostgres) {
                await sql`UPDATE users SET username = ${username}, email = ${email}, phone = ${phone}, role = ${role} WHERE id = ${id}`;
            } else {
                await new Promise((res, rej) => dbSQLite.run('UPDATE users SET username = ?, email = ?, phone = ?, role = ? WHERE id = ?', [username, email, phone, role, id], (err) => err ? rej(err) : res()));
            }
        }
        res.json({ message: "Utilisateur mis à jour avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/users/:id', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { id } = req.params;
    try {
        if (usePostgres) {
            await sql`DELETE FROM users WHERE id = ${id}`;
        } else {
            await new Promise((res, rej) => dbSQLite.run('DELETE FROM users WHERE id = ?', [id], (err) => err ? rej(err) : res()));
        }
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Messaging and Notifications API ---

app.get('/api/rooms', authenticateToken, async (req, res) => {
    try {
        if (usePostgres) {
            const rows = (await sql`SELECT * FROM rooms ORDER BY id DESC`).rows;
            res.json({ success: true, data: rows });
        } else {
            dbSQLite.all('SELECT * FROM rooms ORDER BY id DESC', [], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ success: true, data: rows });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    const { room } = req.query;
    if (!room) return res.status(400).json({ error: 'room query required' });
    try {
        if (usePostgres) {
            const rows = (await sql`SELECT * FROM messages WHERE room = ${room} ORDER BY created_at ASC`).rows;
            res.json({ success: true, data: rows });
        } else {
            dbSQLite.all('SELECT * FROM messages WHERE room = ? ORDER BY created_at ASC', [room], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ success: true, data: rows });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
    const { room, content } = req.body;
    const sender_id = req.user && req.user.id;
    const sender_name = req.user && req.user.username;
    if (!room || !content) return res.status(400).json({ error: 'room and content required' });
    try {
        if (usePostgres) {
            await sql`INSERT INTO rooms (name) VALUES (${room}) ON CONFLICT (name) DO NOTHING`;
            await sql`INSERT INTO messages (room, sender_id, sender_name, content) VALUES (${room}, ${sender_id}, ${sender_name}, ${content})`;
            await sql`INSERT INTO notifications (target, role, message) VALUES ('administrateur', 'administrateur', ${sender_name || 'Utilisateur'} || ' a envoyé un message')`;
            res.json({ success: true });
        } else {
            dbSQLite.serialize(() => {
                dbSQLite.run('INSERT OR IGNORE INTO rooms (name, is_group) VALUES (?, ?)', [room, room.startsWith('group:') ? 1 : 0]);
                dbSQLite.run('INSERT INTO messages (room, sender_id, sender_name, content) VALUES (?, ?, ?, ?)', [room, sender_id, sender_name, content]);
                dbSQLite.run('INSERT INTO notifications (target, role, message) VALUES (?, ?, ?)', ['administrateur', 'administrateur', `${sender_name || 'Utilisateur'} a envoyé un message`], (err) => {});
                res.json({ success: true });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Allow message editing by owner or admin
app.put('/api/messages/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });
    try {
        if (usePostgres) {
            const msg = (await sql`SELECT * FROM messages WHERE id = ${id}`).rows[0];
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            const requesterId = req.user && req.user.id;
            const requesterRole = req.user && req.user.role;
            if (String(requesterId) !== String(msg.sender_id) && requesterRole !== 'administrateur') return res.status(403).json({ error: 'Not allowed' });
            await sql`UPDATE messages SET content = ${content} WHERE id = ${id}`;
            res.json({ success: true });
        } else {
            const msg = await new Promise((resolve, reject) => dbSQLite.get('SELECT * FROM messages WHERE id = ?', [id], (err, row) => err ? reject(err) : resolve(row)));
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            const requesterId = req.user && req.user.id;
            const requesterRole = req.user && req.user.role;
            if (String(requesterId) !== String(msg.sender_id) && requesterRole !== 'administrateur') return res.status(403).json({ error: 'Not allowed' });
            await new Promise((resolve, reject) => dbSQLite.run('UPDATE messages SET content = ? WHERE id = ?', [content, id], (err) => err ? reject(err) : resolve()));
            res.json({ success: true });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Allow message deletion by owner or admin
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        if (usePostgres) {
            const msg = (await sql`SELECT * FROM messages WHERE id = ${id}`).rows[0];
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            const requesterId = req.user && req.user.id;
            const requesterRole = req.user && req.user.role;
            if (String(requesterId) !== String(msg.sender_id) && requesterRole !== 'administrateur') return res.status(403).json({ error: 'Not allowed' });
            await sql`DELETE FROM messages WHERE id = ${id}`;
            res.json({ success: true });
        } else {
            const msg = await new Promise((resolve, reject) => dbSQLite.get('SELECT * FROM messages WHERE id = ?', [id], (err, row) => err ? reject(err) : resolve(row)));
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            const requesterId = req.user && req.user.id;
            const requesterRole = req.user && req.user.role;
            if (String(requesterId) !== String(msg.sender_id) && requesterRole !== 'administrateur') return res.status(403).json({ error: 'Not allowed' });
            await new Promise((resolve, reject) => dbSQLite.run('DELETE FROM messages WHERE id = ?', [id], (err) => err ? reject(err) : resolve()));
            res.json({ success: true });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const role = req.user && req.user.role;
        const username = req.user && req.user.username;
        if (usePostgres) {
            const rows = (await sql`SELECT * FROM notifications WHERE role = ${role} OR target = ${username} ORDER BY created_at DESC`).rows;
            res.json({ success: true, data: rows });
        } else {
            dbSQLite.all('SELECT * FROM notifications WHERE role = ? OR target = ? ORDER BY created_at DESC', [role, username], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ success: true, data: rows });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        if (usePostgres) {
            await sql`UPDATE notifications SET read = true WHERE id = ${id}`;
        } else {
            await new Promise((resolve, reject) => dbSQLite.run('UPDATE notifications SET read = 1 WHERE id = ?', [id], (err) => err ? reject(err) : resolve()));
        }
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

