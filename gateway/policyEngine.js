const db = require('../database');
const config = require('../config');

function evaluatePolicy(req) {
  const { path, method, user, headers } = req;
  const deviceId = headers['x-device-id'];

  // 1. Endpoint Auth dibebaskan dari pengecekan token user biasa (ditangani oleh route auth)
  if (path.startsWith('/auth/')) {
    return { allow: true, reason: 'Auth Endpoint' };
  }

  // 2. Request selain auth wajib menyertakan token yang valid
  if (!user) {
    return { allow: false, reason: 'Missing or Invalid Token' };
  }

  // 3. Pengecekan Service Token (Khusus komunikasi antar-service)
  if (user.role === 'service') {
    if (path === '/transkrip/sinkron' && method === 'POST') {
      return { allow: true, reason: 'Service Token Authorized' };
    }
    return { allow: false, reason: 'Service Token restricted for this endpoint' };
  }

  // 4. Verifikasi Device ID Terdaftar (Kebutuhan 4.3)
  const dbUser = db.prepare("SELECT * FROM users WHERE username = ?").get(user.sub);
  if (!dbUser || dbUser.device_id !== deviceId) {
    return { allow: false, reason: `Unregistered Device ID: ${deviceId}` };
  }

  // 5. Verifikasi Jam Akses (Kebutuhan 4.3 - khusus ubah & finalisasi nilai)
  const isWriteOperation = (path.startsWith('/nilai') && method === 'PUT') || 
                           (path.includes('/finalisasi') && method === 'POST');

  if (isWriteOperation) {
    const currentHour = new Date().getHours();
    if (currentHour < config.WORK_HOUR_START || currentHour >= config.WORK_HOUR_END) {
      return { allow: false, reason: `Access denied outside work hours (${config.WORK_HOUR_START}:00 - ${config.WORK_HOUR_END}:00)` };
    }
  }

  // 6. Kebijakan Berdasarkan Endpoint & Role (Tabel 3 Kebijakan Akses)

  // GET /nilai (Mahasiswa: nilai sendiri, Dosen: kelas yang diampu)
  if (path === '/nilai' && method === 'GET') {
    if (user.role === 'mahasiswa' || user.role === 'dosen') {
      return { allow: true, reason: 'Authorized' };
    }
    return { allow: false, reason: 'Role not authorized' };
  }

  // PUT /nilai/:id (Dosen saja, harus kelas yang diampu, & belum final)
  if (path.startsWith('/nilai/') && method === 'PUT') {
    if (user.role !== 'dosen') return { allow: false, reason: 'Only dosen can edit nilai' };

    const nilaiId = path.split('/')[2];
    const itemNilai = db.prepare("SELECT n.*, k.dosen_id FROM nilai n JOIN kelas k ON n.kelas_id = k.id WHERE n.id = ?").get(nilaiId);

    if (!itemNilai) return { allow: false, reason: 'Nilai not found' };
    if (itemNilai.dosen_id !== dbUser.id) return { allow: false, reason: 'Dosen does not teach this class' };
    if (itemNilai.is_final === 1) return { allow: false, reason: 'Nilai already finalized' };

    return { allow: true, reason: 'Authorized Dosen Edit' };
  }

  // POST /kelas/:id/finalisasi (Dosen saja & kelas yang diampu)
  if (path.startsWith('/kelas/') && path.endsWith('/finalisasi') && method === 'POST') {
    if (user.role !== 'dosen') return { allow: false, reason: 'Only dosen can finalize' };

    const kelasId = path.split('/')[2];
    const kelas = db.prepare("SELECT * FROM kelas WHERE id = ?").get(kelasId);

    if (!kelas) return { allow: false, reason: 'Kelas not found' };
    if (kelas.dosen_id !== dbUser.id) return { allow: false, reason: 'Dosen does not teach this class' };

    return { allow: true, reason: 'Authorized Finalize' };
  }

  // GET /transkrip/:nim (Mahasiswa: NIM sendiri, Admin: semua NIM)
  if (path.startsWith('/transkrip/') && method === 'GET') {
    const targetNim = path.split('/')[2];
    if (user.role === 'admin') return { allow: true, reason: 'Admin full access' };
    if (user.role === 'mahasiswa' && dbUser.nim === targetNim) return { allow: true, reason: 'Mahasiswa self transcript access' };

    return { allow: false, reason: 'Cannot access other student transcript' };
  }

  // POST /transkrip/sinkron (Menolak jika menggunakan token user biasa)
  if (path === '/transkrip/sinkron' && method === 'POST') {
    return { allow: false, reason: 'User tokens are not allowed to access sync endpoint' };
  }

  return { allow: false, reason: 'No matching policy rule' };
}

module.exports = { evaluatePolicy };