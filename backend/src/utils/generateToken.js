const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
      auth_provider: user.auth_provider || "local",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

module.exports = generateToken;