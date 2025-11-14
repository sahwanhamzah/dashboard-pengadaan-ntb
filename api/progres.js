import { pool } from "./db";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const q = `
        SELECT pr.*, pk.nama_paket
        FROM progres_paket pr
        LEFT JOIN paket pk ON pr.paket_id = pk.id
        ORDER BY pr.id DESC
      `;
      const result = await pool.query(q);
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { paket_id, persentase, tgl_update, catatan } = req.body;

      const result = await pool.query(
        `INSERT INTO progres_paket (paket_id, persentase, tgl_update, catatan)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [paket_id, persentase, tgl_update, catatan]
      );

      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
