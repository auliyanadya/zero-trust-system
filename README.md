# Sistem Nilai & Transkrip - Zero Trust Security Architecture

Sistem Nilai dan Transkrip berbasis arsitektur **Zero Trust Security** (NIST SP 800-207)[cite: 3].

---

## 👥 Data Awal (Accounts & Device IDs)

Gunakan daftar kredensial dan `X-Device-ID` berikut untuk pengujian autentikasi, otorisasi, dan kebijakan ABAC di Postman / Thunder Client[cite: 3]:

| Username | Password | Role | NIM | Header `X-Device-ID` | Deskripsi Akses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `admin1` | `pass123` | admin | - | `DEV-ADMIN-01` | Akses seluruh transkrip |
| `dosen_pak_budi` | `pass123` | dosen | - | `DEV-DOSEN-01` | Pengampu Kelas ID 1 (Keamanan Informasi) |
| `dosen_bu_ani` | `pass123` | dosen | - | `DEV-DOSEN-02` | Pengampu Kelas ID 2 (Pemrograman Web) |
| `mhs_andi` | `pass123` | mahasiswa | `2001` | `DEV-MHS-01` | Mahasiswa Kelas ID 1 |
| `mhs_budi` | `pass123` | mahasiswa | `2002` | `DEV-MHS-02` | Mahasiswa Kelas ID 1 |
| `mhs_citra` | `pass123` | mahasiswa | `2003` | `DEV-MHS-03` | Mahasiswa Kelas ID 2 |

### Service Credentials (Internal)
* **Client ID:** `service-nilai-id`
* **Client Secret:** `service-nilai-secret-999`

---

## 🚀 Cara Menjalankan Aplikasi

1. **Install Dependensi:**
   Buka terminal di root folder proyek, lalu jalankan:
   ```bash
   npm install