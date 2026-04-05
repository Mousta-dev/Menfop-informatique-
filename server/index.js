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
const ensureTables = async () => {
    if (usePostgres) {
        try {
            await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT DEFAULT 'utilisateur')`;
            await sql`CREATE TABLE IF NOT EXISTS establishments (id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE)`;
            await sql`CREATE TABLE IF NOT EXISTS equipment (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, establishment_id INTEGER REFERENCES establishments(id))`;
            await sql`CREATE TABLE IF NOT EXISTS reports (id SERIAL PRIMARY KEY, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            await sql`CREATE TABLE IF NOT EXISTS missions (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            
            // Seed Admin Alpha if not exists
            const existingAdmin = await sql`SELECT * FROM users WHERE username = 'Alpha'`;
            if (existingAdmin.rows.length === 0) {
                const hash = await bcrypt.hash('Mousta@2025', 10);
                await sql`INSERT INTO users (username, password, role) VALUES ('Alpha', ${hash}, 'administrateur')`;
                console.log('Seed: Admin Alpha created in Postgres.');
            }
        } catch (err) {
            console.error('Postgres init error:', err);
        }
    } else {
        dbSQLite.serialize(() => {
            dbSQLite.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT DEFAULT 'utilisateur')`);
            dbSQLite.run(`CREATE TABLE IF NOT EXISTS establishments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`);
            dbSQLite.run(`CREATE TABLE IF NOT EXISTS equipment (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, status TEXT NOT NULL, establishment_id INTEGER, FOREIGN KEY (establishment_id) REFERENCES establishments(id))`);
            dbSQLite.run(`CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
            dbSQLite.run(`CREATE TABLE IF NOT EXISTS missions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
            
            bcrypt.hash('Mousta@2025', 10, (err, hash) => {
                if (!err) dbSQLite.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['Alpha', hash, 'administrateur']);
            });
        });
    }
};

// --- Middleware to ensure tables are ready ---
app.use(async (req, res, next) => {
    try {
        await ensureTables();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database initialization failed" });
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
    const { username, password } = req.body;
    try {
        let user;
        if (usePostgres) {
            const result = await sql`SELECT * FROM users WHERE username = ${username}`;
            user = result.rows[0];
        } else {
            user = await new Promise((res, rej) => dbSQLite.get('SELECT * FROM users WHERE username = ?', [username], (err, r) => err ? rej(err) : res(r)));
        }

        if (!user) return res.json({ success: false, message: 'Identifiants invalides' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
            res.json({ success: true, token, role: user.role });
        } else {
            res.json({ success: false, message: 'Identifiants invalides' });
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

app.get('/api/equipment/new', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT e.*, est.name as establishment_name FROM equipment e JOIN establishments est ON e.establishment_id = est.id WHERE e.status = 'new'`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "new"', [], (err, r) => err ? rej(err) : res(r)));
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

app.get('/api/missions', authenticateToken, async (req, res) => {
    try {
        let rows;
        if (usePostgres) rows = (await sql`SELECT * FROM missions ORDER BY created_at DESC`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT * FROM missions ORDER BY created_at DESC', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ message: "success", data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/missions', authenticateToken, async (req, res) => {
    const { name, description, status } = req.body;
    try {
        if (usePostgres) {
            const result = await sql`INSERT INTO missions (name, description, status) VALUES (${name}, ${description}, ${status || 'pending'}) RETURNING id`;
            res.status(201).json({ message: "success", data: { id: result.rows[0].id, name, description, status: status || 'pending' } });
        } else {
            dbSQLite.run('INSERT INTO missions (name, description, status) VALUES (?, ?, ?)', [name, description, status || 'pending'], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.status(201).json({ message: "success", data: { id: this.lastID, name, description, status: status || 'pending' } });
            });
        }
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
        if (usePostgres) rows = (await sql`SELECT id, username, role FROM users`).rows;
        else rows = await new Promise((res, rej) => dbSQLite.all('SELECT id, username, role FROM users', [], (err, r) => err ? rej(err) : res(r)));
        res.json({ data: rows });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/users', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        if (usePostgres) {
            const result = await sql`INSERT INTO users (username, password, role) VALUES (${username}, ${hash}, ${role || 'utilisateur'}) RETURNING id`;
            res.status(201).json({ message: "success", id: result.rows[0].id });
        } else {
            dbSQLite.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role || 'utilisateur'], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.status(201).json({ message: "success", id: this.lastID });
            });
        }
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/users/:id', authenticateToken, authorizeRole('administrateur'), async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;
    try {
        let query;
        let params = [];
        
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            if (usePostgres) {
                await sql`UPDATE users SET username = ${username}, password = ${hash}, role = ${role} WHERE id = ${id}`;
            } else {
                await new Promise((res, rej) => dbSQLite.run('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?', [username, hash, role, id], (err) => err ? rej(err) : res()));
            }
        } else {
            if (usePostgres) {
                await sql`UPDATE users SET username = ${username}, role = ${role} WHERE id = ${id}`;
            } else {
                await new Promise((res, rej) => dbSQLite.run('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, id], (err) => err ? rej(err) : res()));
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

module.exports = app;
