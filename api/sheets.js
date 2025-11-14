import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // --- Hanya terima POST ---
  if (req.method === 'POST') {
    const { nama, jabatan, email } = req.body

    try {
      await pool.query(
        'INSERT INTO pegawai (nama, jabatan, email) VALUES ($1, $2, $3)',
        [nama, jabatan, email]
      )

      return res.status(200).json({ success: true })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Gagal menyimpan ke Neon' })
    }
  }

  // Jika method selain POST
  return res.status(405).json({ message: 'Method Not Allowed' })
}
