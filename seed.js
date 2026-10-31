const db = require('./database');

// Reset Data
db.prepare("DELETE FROM users").run();
db.prepare("DELETE FROM kelas").run();
db.prepare("DELETE FROM nilai").run();
db.prepare("DELETE FROM audit_logs").run();
db.prepare("DELETE FROM refresh_tokens").run();

// Seed Users
db.prepare("INSERT INTO users (id, username, password, role, nim, device_id) VALUES (?, ?, ?, ?, ?, ?)")
  .run(1, "admin1", "pass123", "admin", null, "DEV-ADMIN-01");
db.prepare("INSERT INTO users (id, username, password, role, nim, device_id) VALUES (?, ?, ?, ?, ?, ?)")
  .run(2, "dosen_pak_budi", "pass123", "dosen", null, "DEV-DOSEN-01");
db.prepare("INSERT INTO users (id, username, password, role, nim, device_id) VALUES (?, ?, ?, ?, ?, ?)")
  .run(3, "dosen_bu_ani", "pass123", "dosen", null, "DEV-DOSEN-02");
db.prepare("INSERT INTO users (id, username, password, role, nim, device_id) VALUES (?, ?, ?, ?, ?, ?)")
  .run(4, "mhs_andi", "pass123", "mahasiswa", "2001", "DEV-MHS-01");
db.prepare("INSERT INTO users (id, username, password, role, nim, device_id) VALUES (?, ?, ?, ?, ?, ?)")
  .run(5, "mhs_budi", "pass123", "mahasiswa", "2002", "DEV-MHS-02");
db.prepare("INSERT INTO users (id, username, password, role, nim, device_id) VALUES (?, ?, ?, ?, ?, ?)")
  .run(6, "mhs_citra", "pass123", "mahasiswa", "2003", "DEV-MHS-03");

// Seed Kelas
db.prepare("INSERT INTO kelas (id, nama_kelas, dosen_id) VALUES (?, ?, ?)").run(1, "Keamanan Informasi", 2);
db.prepare("INSERT INTO kelas (id, nama_kelas, dosen_id) VALUES (?, ?, ?)").run(2, "Pemrograman Web", 3);

// Seed Nilai
db.prepare("INSERT INTO nilai (id, kelas_id, mahasiswa_nim, nilai, is_final) VALUES (?, ?, ?, ?, ?)").run(101, 1, "2001", 85, 0);
db.prepare("INSERT INTO nilai (id, kelas_id, mahasiswa_nim, nilai, is_final) VALUES (?, ?, ?, ?, ?)").run(102, 1, "2002", 78, 0);
db.prepare("INSERT INTO nilai (id, kelas_id, mahasiswa_nim, nilai, is_final) VALUES (?, ?, ?, ?, ?)").run(103, 2, "2003", 90, 0);

console.log("Database seeded successfully!");