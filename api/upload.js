const Busboy = require('busboy');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must use Service Role for writing
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
    api: {
        bodyParser: false, // We need raw body for busboy
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Security Check
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const busboy = Busboy({ headers: req.headers });
    const fileBuffers = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        file.on('data', (data) => {
            fileBuffers.push(data);
        });
    });

    busboy.on('finish', async () => {
        if (fileBuffers.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const buffer = Buffer.concat(fileBuffers);

        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            if (data.length === 0) {
                return res.status(400).json({ error: 'Empty Excel file' });
            }

            // Process and Map Data
            const students = data.map(row => {
                // Robust mapping: handle variations in casing or spacing if needed, 
                // but typically we expect exact matches or clean them up.
                // We will assume the Excel headers match the keys we look for roughly.

                // Helper to find value case-insensitively
                const getValue = (key) => {
                    const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
                    return foundKey ? row[foundKey] : null;
                };

                // Date parsing helper (Excel dates are sometimes numbers)
                const parseDate = (val) => {
                    if (!val) return null;
                    if (typeof val === 'number') {
                        // Excel date to JS Date
                        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                        return date.toISOString().split('T')[0];
                    }
                    // Try string parsing
                    return new Date(val).toISOString().split('T')[0];
                };

                return {
                    nama_lengkap: getValue('Nama Lengkap') || getValue('Nama'),
                    nisn: String(getValue('NISN')), // Ensure string
                    tanggal_lahir: parseDate(getValue('Tanggal Lahir')),

                    nilai_indonesia: parseFloat(getValue('Nilai Indonesia') || 0),
                    kategori_indonesia: getValue('Kategori Indonesia'),

                    nilai_matematika: parseFloat(getValue('Nilai Matematika') || 0),
                    kategori_matematika: getValue('Kategori Matematika'),

                    nilai_inggris: parseFloat(getValue('Nilai Inggris') || 0),
                    kategori_inggris: getValue('Kategori Inggris'),

                    nama_mapel_pilihan_1: getValue('Nama Mapel Pilihan 1'),
                    nilai_pilihan_1: parseFloat(getValue('Nilai Pilihan 1') || 0),
                    kategori_pilihan_1: getValue('Kategori Pilihan 1'),

                    nama_mapel_pilihan_2: getValue('Nama Mapel Pilihan 2'),
                    nilai_pilihan_2: parseFloat(getValue('Nilai Pilihan 2') || 0),
                    kategori_pilihan_2: getValue('Kategori Pilihan 2'),

                    updated_at: new Date()
                };
            });

            // Upsert to Supabase
            const { data: result, error } = await supabase
                .from('students')
                .upsert(students, { onConflict: 'nisn' })
                .select();

            if (error) {
                console.error('Supabase Error:', error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ message: `Successfully processed ${students.length} records.`, count: students.length });

        } catch (err) {
            console.error('Processing Error:', err);
            return res.status(500).json({ error: 'Failed to process file' });
        }
    });

    busboy.on('error', (err) => {
        console.error('Busboy Error:', err);
        res.status(500).json({ error: 'Upload failed' });
    });

    req.pipe(busboy);
}
