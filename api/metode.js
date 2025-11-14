import { pool } from "./db";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM metode_pemilihan ORDER BY id");
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { nama_metode } = req.body;
      const result = await pool.query(
        "INSERT INTO metode_pemilihan (nama_metode) VALUES ($1) RETURNING *",
        [nama_metode]
      );
      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
