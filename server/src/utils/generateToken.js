const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (user) => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET no está configurado.");
  }

  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
};

module.exports = generateToken;
