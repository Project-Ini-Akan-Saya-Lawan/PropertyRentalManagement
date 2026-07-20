// src/middlewares/adminAuth.js
// Harus dipakai SETELAH authenticateJWT, karena bergantung pada req.user
// yang diisi dari payload JWT (lihat generateToken.js -> role_id).
//
// role_id: 1 = admin, 2 = tenant/user biasa (lihat auth.controller.js signup)

function adminAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Token tidak ada atau tidak valid." });
  }

  if (req.user.role_id !== 1) {
    return res.status(403).json({ message: "Akses ditolak. Hanya admin yang diizinkan." });
  }

  next();
}

module.exports = adminAuth;
