import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Fungsi utama handler
export default async function handler(req, res) {
  // ✅ Tambahkan header CORS di sini
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // ✅ Untuk menangani preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // ✅ Method utama
  if (req.method === 'POST') {
    const { nama, jabatan, email } = req.body

    try {
      await pool.query(
        'INSERT INTO pegawai (nama, jabatan, email) VALUES ($1, $2, $3)',
        [nama, jabatan, email]
      )
      res.status(200).json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Gagal menyimpan ke Neon' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
