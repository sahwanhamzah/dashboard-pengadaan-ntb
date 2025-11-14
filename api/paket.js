import { pool } from "./db";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const q = `
        SELECT p.*, 
          o.nama_opd,
          py.nama_penyedia,
          m.nama_metode
        FROM paket p
        LEFT JOIN opd o ON p.opd_id = o.id
        LEFT JOIN penyedia py ON p.penyedia_id = py.id
        LEFT JOIN metode_pemilihan m ON p.metode_id = m.id
        ORDER BY p.id DESC
      `;
      const result = await pool.query(q);
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const {
        tahun, nama_paket, opd_id, pagu, hps, penyedia_id,
        metode_id, tgl_kontrak, nilai_kontrak, tgl_mulai,
        tgl_selesai, keterangan
      } = req.body;

      const q = `
        INSERT INTO paket (
          tahun, nama_paket, opd_id, pagu, hps, penyedia_id,
          metode_id, tgl_kontrak, nilai_kontrak, tgl_mulai,
          tgl_selesai, keterangan
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        ) RETURNING *
      `;

      const result = await pool.query(q, [
        tahun, nama_paket, opd_id, pagu, hps, penyedia_id,
        metode_id, tgl_kontrak, nilai_kontrak, tgl_mulai,
        tgl_selesai, keterangan
      ]);

      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
