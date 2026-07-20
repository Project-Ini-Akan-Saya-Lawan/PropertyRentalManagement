// src/controllers/properties.controller.js
const pool = require('../../db');

// GET semua properti (tower)
const getProperties = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Properties_Towers ORDER BY property_id ASC');
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// GET detail satu properti, termasuk floor pack & foto terkait
const getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const property = await pool.query('SELECT * FROM Properties_Towers WHERE property_id = $1', [id]);
        if (property.rows.length === 0) {
            return res.status(404).json({ message: 'Properti tidak ditemukan.' });
        }

        const packs = await pool.query('SELECT * FROM Floor_Packs WHERE property_id = $1', [id]);
        const photos = await pool.query('SELECT * FROM Properties_Photo WHERE property_id = $1', [id]);

        res.status(200).json({
            data: {
                ...property.rows[0],
                floor_packs: packs.rows,
                photos: photos.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST buat properti baru
const createProperty = async (req, res) => {
    const { property_name, description, total_floor } = req.body;
    if (!property_name || !total_floor) {
        return res.status(400).json({ message: 'property_name dan total_floor wajib diisi.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO Properties_Towers (property_name, description, total_floor)
             VALUES ($1, $2, $3) RETURNING *`,
            [property_name, description || null, total_floor]
        );
        res.status(201).json({ message: 'Properti berhasil dibuat.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// PUT update properti
const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { property_name, description, total_floor } = req.body;
    try {
        const result = await pool.query(
            `UPDATE Properties_Towers
             SET property_name = COALESCE($1, property_name),
                 description = COALESCE($2, description),
                 total_floor = COALESCE($3, total_floor)
             WHERE property_id = $4 RETURNING *`,
            [property_name, description, total_floor, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Properti tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Properti berhasil diperbarui.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE properti
const deleteProperty = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Properties_Towers WHERE property_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Properti tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Properti berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty };
