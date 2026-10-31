const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');

const app = express();
app.use(express.json());

const JWT_SECRET = 'super-secret-jwt-key';
const GATEWAY_SECRET = 'secret-gateway-key-123';

// 1. Endpoint Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const deviceId = req.headers['x-device-id'];

  if (!deviceId) {
    return res.status(401).json({ error: 'Device ID wajib dikirim pada header' });
  }

  // AlaSQL Syntax Query
  const users = db('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
  const user = users[0];

  if (!user) {
    return res.status(401).json({ error: 'Kredensial tidak valid atau Device tidak terdaftar' });
  }

  // Verifikasi Device ID
  const devices = db('SELECT * FROM devices WHERE user_id = ? AND device_id = ?', [user.id, deviceId]);
  if (devices.length === 0) {
    return res.status(401).json({ error: 'Kredensial tidak valid atau Device tidak terdaftar' });
  }

  // Generate JWT Token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, nim: user.nim },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({ access_token: token });
});

// Middleware Verifikasi Token & Device ID
const verifyZeroTrust = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const deviceId = req.headers['x-device-id'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verifikasi apakah device id milik user
    const devices = db('SELECT * FROM devices WHERE user_id = ? AND device_id = ?', [decoded.id, deviceId]);
    if (devices.length === 0) {
      return res.status(401).json({ error: 'Unregistered Device ID' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Proxy route ke Service Nilai (Port 3001)
app.use('/nilai', verifyZeroTrust, async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3001/nilai${req.url}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Secret': GATEWAY_SECRET,
        'X-User-Data': JSON.stringify(req.user)
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke Service Nilai' });
  }
});

// Proxy route ke Service Transkrip (Port 3002)
app.use('/transkrip', verifyZeroTrust, async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3002/transkrip${req.url}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Secret': GATEWAY_SECRET,
        'X-User-Data': JSON.stringify(req.user)
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke Service Transkrip' });
  }
});

app.listen(3000, () => {
  console.log('API Gateway (PEP) running on port 3000');
});