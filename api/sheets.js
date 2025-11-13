import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nama, jabatan, email } = req.body;
    try {
      await pool.query(
        'INSERT INTO pegawai (nama, jabatan, email) VALUES ($1, $2, $3)',
        [nama, jabatan, email]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menyimpan ke Neon' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
