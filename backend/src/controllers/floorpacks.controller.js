// src/controllers/floorpacks.controller.js
const pool = require('../../db');

// GET semua floor pack, bisa difilter dengan query ?property_id=
const getFloorPacks = async (req, res) => {
    const { property_id } = req.query;
    try {
        let result;
        if (property_id) {
            result = await pool.query('SELECT * FROM Floor_Packs WHERE property_id = $1 ORDER BY pack_id ASC', [property_id]);
        } else {
            result = await pool.query('SELECT * FROM Floor_Packs ORDER BY pack_id ASC');
        }
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// GET detail floor pack, termasuk amenities & foto
const getFloorPackById = async (req, res) => {
    const { id } = req.params;
    try {
        const pack = await pool.query('SELECT * FROM Floor_Packs WHERE pack_id = $1', [id]);
        if (pack.rows.length === 0) {
            return res.status(404).json({ message: 'Floor pack tidak ditemukan.' });
        }

        const amenities = await pool.query(
            `SELECT a.* FROM Amenities a
             JOIN Pack_Amenities pa ON pa.amenities_id = a.amenities_id
             WHERE pa.pack_id = $1`,
            [id]
        );
        const photos = await pool.query('SELECT * FROM Properties_Photo WHERE pack_id = $1', [id]);

        res.status(200).json({
            data: {
                ...pack.rows[0],
                amenities: amenities.rows,
                photos: photos.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST buat floor pack baru
const createFloorPack = async (req, res) => {
    const { pack_name, property_id, description, floor_range } = req.body;
    if (!pack_name || !property_id) {
        return res.status(400).json({ message: 'pack_name dan property_id wajib diisi.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO Floor_Packs (pack_name, property_id, description, floor_range)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [pack_name, property_id, description || null, floor_range || null]
        );
        res.status(201).json({ message: 'Floor pack berhasil dibuat.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// PUT update floor pack
const updateFloorPack = async (req, res) => {
    const { id } = req.params;
    const { pack_name, property_id, description, floor_range } = req.body;
    try {
        const result = await pool.query(
            `UPDATE Floor_Packs
             SET pack_name = COALESCE($1, pack_name),
                 property_id = COALESCE($2, property_id),
                 description = COALESCE($3, description),
                 floor_range = COALESCE($4, floor_range)
             WHERE pack_id = $5 RETURNING *`,
            [pack_name, property_id, description, floor_range, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Floor pack tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Floor pack berhasil diperbarui.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE floor pack
const deleteFloorPack = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Floor_Packs WHERE pack_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Floor pack tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Floor pack berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { getFloorPacks, getFloorPackById, createFloorPack, updateFloorPack, deleteFloorPack };
