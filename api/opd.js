import { pool } from "./db";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM opd ORDER BY id ASC");
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { nama_opd } = req.body;
      const result = await pool.query(
        "INSERT INTO opd (nama_opd) VALUES ($1) RETURNING *",
        [nama_opd]
      );
      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
