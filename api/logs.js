import { pool } from "./db";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM logs ORDER BY id DESC");
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { aksi, deskripsi, ip } = req.body;

      const result = await pool.query(
        `INSERT INTO logs (aksi, deskripsi, ip) VALUES ($1,$2,$3) RETURNING *`,
        [aksi, deskripsi, ip]
      );

      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
