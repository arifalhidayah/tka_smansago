# Cek Nilai TKA

Aplikasi web sederhana untuk mengecek nilai TKA siswa, dibangun dengan Vercel Serverless Functions, Supabase, dan Vanilla JS.

## Fitur
- **Admin**: Upload data nilai via Excel (dilindungi token).
- **Siswa**: Cari nilai berdasarkan Nama, NISN, dan Tanggal Lahir.
- **Dinamis**: Menampilkan mata pelajaran pilihan sesuai data di database.

## Instalasi & Setup

### 1. Persiapan Database (Supabase)
Masuk ke SQL Editor di dashboard Supabase Anda dan jalankan query berikut:

```sql
create table public.students (
  id uuid default gen_random_uuid() primary key,
  nama_lengkap text not null,
  nisn text not null unique,
  tanggal_lahir date not null,
  nilai_indonesia float8, kategori_indonesia text,
  nilai_matematika float8, kategori_matematika text,
  nilai_inggris float8, kategori_inggris text,
  nama_mapel_pilihan_1 text, nilai_pilihan_1 float8, kategori_pilihan_1 text,
  nama_mapel_pilihan_2 text, nilai_pilihan_2 float8, kategori_pilihan_2 text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_students_nisn on public.students(nisn);
create index idx_students_nama on public.students(nama_lengkap);
```

### 2. Environment Variables
Di Vercel (Project Settings > Environment Variables), tambahkan:

- `SUPABASE_URL`: URL project Supabase Anda.
- `SUPABASE_SERVICE_ROLE_KEY`: Kunci Service Role (PENTING: Jangan gunakan Anon Key untuk upload).
- `ADMIN_SECRET`: Token rahasia pilihan Anda untuk login admin (misal: `Rahasia123`).

### 3. Deploy ke Vercel
Gunakan Vercel CLI atau hubungkan repository GitHub Anda.
```bash
vercel deploy
```

---

## Format File Excel (Header Row)
Pastikan baris pertama (Header) file Excel Anda sesuai dengan nama-nama berikut (Case-Insensitive):

| Header Excel | Keterangan |
|--------------|------------|
| **Nama Lengkap** | Nama Siswa |
| **NISN** | Nomor Induk Siswa Nasional |
| **Tanggal Lahir** | Format: YYYY-MM-DD atau Excel Date |
| **Nilai Indonesia** | Angka (0-100) |
| **Kategori Indonesia** | A, B, C, Lulus, dsb |
| **Nilai Matematika** | Angka |
| **Kategori Matematika** | Teks |
| **Nilai Inggris** | Angka |
| **Kategori Inggris** | Teks |
| **Nama Mapel Pilihan 1** | Misal: "Biologi" |
| **Nilai Pilihan 1** | Angka |
| **Kategori Pilihan 1** | Teks |
| **Nama Mapel Pilihan 2** | Misal: "Ekonomi" |
| **Nilai Pilihan 2** | Angka |
| **Kategori Pilihan 2** | Teks |

**Contoh Baris Data:**
`Budi Santoso | 1234567890 | 2005-08-17 | 85.5 | Baik | 90 | Sangat Baik | ...`

---

## Lokal Development
Untuk menjalankan di lokal:
1. `npm install`
2. Buat file `.env` berisi variable di atas.
3. Jalankan `vercel dev` (Butuh Vercel CLI).
