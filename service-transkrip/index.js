const express = require('express');
const db = require('../database');

const app = express();
app.use(express.json());

const GATEWAY_SECRET = 'secret-gateway-key-123';

// Middleware pengecekan apakah request datang dari API Gateway
app.use((req, res, next) => {
  const secret = req.headers['x-gateway-secret'];
  if (secret !== GATEWAY_SECRET) {
    return res.status(403).json({ 
      error: 'Direct access forbidden. Access must go through API Gateway.' 
    });
  }
  next();
});

// Endpoint Ambil Transkrip
app.get('/transkrip', (req, res) => {
  try {
    const userDataHeader = req.headers['x-user-data'];
    if (!userDataHeader) {
      return res.status(400).json({ error: 'User data header missing' });
    }

    const user = JSON.parse(userDataHeader);

    let query = '';
    let params = [];

    if (user.role === 'mahasiswa') {
      // Mahasiswa hanya bisa melihat transkrip milik NIM nya sendiri
      query = `SELECT * FROM transkrip WHERE nim = ?`;
      params = [user.nim];
    } else {
      // Admin/Dosen bisa melihat semua transkrip
      query = `SELECT * FROM transkrip`;
    }

    const result = db(query, params);
    return res.json({ data: result });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.listen(3002, () => {
  console.log('Service Transkrip running on port 3002');
});