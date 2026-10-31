const express = require('express');
const db = require('../database');

const app = express();
app.use(express.json());

const GATEWAY_SECRET = 'secret-gateway-key-123';

// Middleware semakan request dari API Gateway
app.use((req, res, next) => {
  const secret = req.headers['x-gateway-secret'];
  if (secret !== GATEWAY_SECRET) {
    return res.status(403).json({ 
      error: 'Direct access forbidden. Access must go through API Gateway.' 
    });
  }
  next();
});

// Endpoint GET Data Nilai
app.get('/nilai', (req, res) => {
  try {
    const userDataHeader = req.headers['x-user-data'];
    if (!userDataHeader) {
      return res.status(400).json({ error: 'User data header missing' });
    }

    const user = JSON.parse(userDataHeader);

    let query = '';
    let params = [];

    if (user.role === 'mahasiswa') {
      query = `
        SELECT n.id, m.kode_mk, m.nama_mk, n.nilai, n.status 
        FROM nilai n
        JOIN mata_kuliah m ON n.mk_id = m.id
        WHERE n.mahasiswa_id = ?
      `;
      params = [user.id];
    } else if (user.role === 'dosen') {
      query = `
        SELECT n.id, u.username as mahasiswa, m.kode_mk, m.nama_mk, n.nilai, n.status 
        FROM nilai n
        JOIN mata_kuliah m ON n.mk_id = m.id
        JOIN users u ON n.mahasiswa_id = u.id
        WHERE m.dosen_id = ?
      `;
      params = [user.id];
    } else {
      query = `
        SELECT n.id, u.username as mahasiswa, m.kode_mk, m.nama_mk, n.nilai, n.status 
        FROM nilai n
        JOIN mata_kuliah m ON n.mk_id = m.id
        JOIN users u ON n.mahasiswa_id = u.id
      `;
    }

    const result = db(query, params);
    return res.json({ data: result });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Endpoint PUT Update Nilai (Peraturan ABAC untuk Dosen)
app.put('/nilai/:id', (req, res) => {
  try {
    const userDataHeader = req.headers['x-user-data'];
    if (!userDataHeader) {
      return res.status(400).json({ error: 'User data header missing' });
    }

    const user = JSON.parse(userDataHeader);
    const nilaiId = req.params.id;
    const { nilai } = req.body;

    // Semak data nilai dan mata kuliah berkaitan
    const record = db(`
      SELECT n.id, m.dosen_id 
      FROM nilai n 
      JOIN mata_kuliah m ON n.mk_id = m.id 
      WHERE n.id = ?
    `, [nilaiId])[0];

    if (!record) {
      return res.status(404).json({ error: 'Data nilai tidak dijumpai' });
    }

    // Kawalan ABAC: Dosen hanya boleh mengemas kini nilai mata kuliah yang diampunya sahaja
    if (user.role === 'dosen' && record.dosen_id !== user.id) {
      return res.status(403).json({ 
        error: 'Access Denied: You do not teach this course' 
      });
    }

    // Kemas kini nilai jika sah / admin
    db('UPDATE nilai SET nilai = ? WHERE id = ?', [nilai, nilaiId]);
    return res.json({ message: 'Nilai berjaya dikemas kini' });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.listen(3001, () => {
  console.log('Service Nilai running on port 3001');
});