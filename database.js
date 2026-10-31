const alasql = require('alasql');

// Inisialisasi tabel di memori
alasql(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(250),
    role VARCHAR(20),
    nim VARCHAR(20)
  );

  CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    device_id VARCHAR(100)
  );

  CREATE TABLE IF NOT EXISTS mata_kuliah (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_mk VARCHAR(20),
    nama_mk VARCHAR(100),
    dosen_id INT
  );

  CREATE TABLE IF NOT EXISTS nilai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id INT,
    mk_id INT,
    nilai INT,
    status VARCHAR(20) DEFAULT 'DRAFT'
  );

  CREATE TABLE IF NOT EXISTS transkrip (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nim VARCHAR(20),
    kode_mk VARCHAR(20),
    nama_mk VARCHAR(100),
    nilai INT,
    diisi_pada DATETIME DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT NOW(),
    user VARCHAR(50),
    action VARCHAR(100),
    resource VARCHAR(100),
    decision VARCHAR(10),
    reason VARCHAR(255)
  );
`);

// Fungsi untuk seeding data secara otomatis ke dalam memori
function seedData() {
  try {
    const users = alasql('SELECT * FROM users');
    if (users.length > 0) return;
  } catch (e) {
    // Abaikan jika tabel belum siap
  }

  alasql(`
    INSERT INTO users (id, username, password, role, nim) VALUES
      (1, 'admin1', 'pass123', 'admin', NULL),
      (2, 'dosen_pak_budi', 'pass123', 'dosen', NULL),
      (3, 'dosen_bu_ani', 'pass123', 'dosen', NULL),
      (4, 'mhs_andi', 'pass123', 'mahasiswa', '2001'),
      (5, 'mhs_budi', 'pass123', 'mahasiswa', '2002'),
      (6, 'mhs_citra', 'pass123', 'mahasiswa', '2003');

    INSERT INTO devices (user_id, device_id) VALUES
      (1, 'DEV-ADMIN-01'),
      (2, 'DEV-DOSEN-01'),
      (3, 'DEV-DOSEN-02'),
      (4, 'DEV-MHS-01'),
      (5, 'DEV-MHS-02'),
      (6, 'DEV-MHS-03');

    INSERT INTO mata_kuliah (id, kode_mk, nama_mk, dosen_id) VALUES
      (1, 'IF101', 'Keamanan Informasi', 2),
      (2, 'IF102', 'Pemrograman Web', 3);

    INSERT INTO nilai (id, mahasiswa_id, mk_id, nilai, status) VALUES
      (101, 4, 1, 85, 'DRAFT'),
      (102, 5, 1, 78, 'DRAFT'),
      (103, 6, 2, 90, 'DRAFT');
  `);
}

// Jalankan otomatis
seedData();

module.exports = alasql;