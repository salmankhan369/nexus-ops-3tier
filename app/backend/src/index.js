const express = require('express');
const cors = require('cors');
const os = require('os');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Liveness & Readiness Probe for Kubernetes ALB & Kubelet
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'UP',
      tier: 'Backend API (Private Compute Subnet)',
      pod: os.hostname(),
      database: 'AWS RDS MySQL Connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'DEGRADED',
      pod: os.hostname(),
      database: 'Disconnected',
      error: err.message
    });
  }
});

// Get all records from RDS MySQL
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json({ pod: os.hostname(), data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert new record into RDS MySQL
app.post('/api/tasks', async (req, res) => {
  const { title, environment } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, environment) VALUES (?, ?)',
      [title.trim(), environment || 'production']
    );
    res.status(201).json({
      id: result.insertId,
      title: title.trim(),
      environment: environment || 'production',
      pod: os.hostname()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete record
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  try {
    await initDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend API running on port ${PORT} | Pod: ${os.hostname()}`);
    });

    // Graceful shutdown for Kubernetes Pod termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Closing HTTP server & DB pool...');
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  }
}

startServer();