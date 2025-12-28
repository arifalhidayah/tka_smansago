const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
// We use Service Role Key here to bypass RLS for this specific "Login-like" search.
// Since we are validating strict criteria (Name + NISN + DOB), it is secure enough for this use case.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { nama, nisn, tanggal_lahir } = req.body;

    if (!nama || !nisn || !tanggal_lahir) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Exact match on NISN and DOB, Case-insensitive match on Name
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('nisn', nisn)
            .eq('tanggal_lahir', tanggal_lahir)
            .ilike('nama_lengkap', nama) // ILIKE for case-insensitive
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Code for no rows found
                return res.status(404).json({ error: 'Data siswa tidak ditemukan. Periksa kembali input Anda.' });
            }
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json(data);

    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
