-- Create Students Table
create table public.students (
  id uuid default gen_random_uuid() primary key,
  nama_lengkap text not null,
  nisn text not null unique,
  tanggal_lahir date not null,
  
  -- Nilai Wajib
  nilai_indonesia float8,
  kategori_indonesia text,
  nilai_matematika float8,
  kategori_matematika text,
  nilai_inggris float8,
  kategori_inggris text,
  
  -- Nilai Pilihan
  nama_mapel_pilihan_1 text,
  nilai_pilihan_1 float8,
  kategori_pilihan_1 text,
  
  nama_mapel_pilihan_2 text,
  nilai_pilihan_2 float8,
  kategori_pilihan_2 text,
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) is recommended, but for simplicity of this specific use case 
-- where read access is public (or via protected API search) and write is admin-only via service key, 
-- we will rely on API logic. However, enabling RLS is best practice.
alter table public.students enable row level security;

-- Create policy to allow public read (or restrict if you only want API access)
-- For this app, we will use the Service Role Key in the backend for writing, 
-- and Anon Key for reading if we used client-side querying.
-- But since we use serverless functions for everything:
-- 1. `search.js` will likely use the Service Role or Anon Key to query.
-- 2. `upload.js` uses Service Key to upsert.

-- Index for faster search
create index idx_students_nisn on public.students(nisn);
create index idx_students_nama on public.students(nama_lengkap);
