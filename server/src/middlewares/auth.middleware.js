const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const env = require("../config/env");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado. Token no proporcionado.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!env.jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET no está configurado en el servidor.",
      });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o incompleto.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Usuario desactivado. Contactá a un administrador.",
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado. Iniciá sesión nuevamente.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido o no autorizado.",
      });
    }

    next(error);
  }
};

module.exports = authMiddleware;
