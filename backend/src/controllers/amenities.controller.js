// src/controllers/amenities.controller.js
const pool = require('../../db');

// GET semua amenities
const getAmenities = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Amenities ORDER BY amenities_id ASC');
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST buat amenity baru
const createAmenity = async (req, res) => {
    const { amenities_name, is_public } = req.body;
    if (!amenities_name) {
        return res.status(400).json({ message: 'amenities_name wajib diisi.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO Amenities (amenities_name, is_public) VALUES ($1, $2) RETURNING *`,
            [amenities_name, is_public !== undefined ? is_public : true]
        );
        res.status(201).json({ message: 'Amenity berhasil dibuat.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// PUT update amenity
const updateAmenity = async (req, res) => {
    const { id } = req.params;
    const { amenities_name, is_public } = req.body;
    try {
        const result = await pool.query(
            `UPDATE Amenities
             SET amenities_name = COALESCE($1, amenities_name),
                 is_public = COALESCE($2, is_public)
             WHERE amenities_id = $3 RETURNING *`,
            [amenities_name, is_public, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Amenity tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Amenity berhasil diperbarui.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE amenity
const deleteAmenity = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Amenities WHERE amenities_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Amenity tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Amenity berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST assign amenity ke floor pack
const assignAmenityToPack = async (req, res) => {
    const { amenities_id, pack_id } = req.body;
    if (!amenities_id || !pack_id) {
        return res.status(400).json({ message: 'amenities_id dan pack_id wajib diisi.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO Pack_Amenities (amenities_id, pack_id) VALUES ($1, $2)
             ON CONFLICT (amenities_id, pack_id) DO NOTHING RETURNING *`,
            [amenities_id, pack_id]
        );
        res.status(201).json({ message: 'Amenity berhasil ditautkan ke floor pack.', data: result.rows[0] || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE lepas amenity dari floor pack
const removeAmenityFromPack = async (req, res) => {
    const { amenitiesId, packId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM Pack_Amenities WHERE amenities_id = $1 AND pack_id = $2 RETURNING *',
            [amenitiesId, packId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Relasi amenity-floor pack tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Amenity berhasil dilepas dari floor pack.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    getAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    assignAmenityToPack,
    removeAmenityFromPack
};
