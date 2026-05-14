const prisma = require("../config/prisma");
const generateToken = require("../utils/generateToken");
const { comparePassword } = require("../utils/password");

const formatUserResponse = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    lastAccessAt: user.lastAccessAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    const error = new Error("Email y contraseña son obligatorios.");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    const error = new Error("Credenciales inválidas.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.active) {
    const error = new Error("Usuario desactivado. Contactá a un administrador.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error("Credenciales inválidas.");
    error.statusCode = 401;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastAccessAt: new Date(),
    },
  });

  const token = generateToken(updatedUser);

  return {
    token,
    user: formatUserResponse(updatedUser),
  };
};

const getAuthenticatedUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error = new Error("Usuario no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (!user.active) {
    const error = new Error("Usuario desactivado. Contactá a un administrador.");
    error.statusCode = 403;
    throw error;
  }

  return formatUserResponse(user);
};

module.exports = {
  loginUser,
  getAuthenticatedUser,
  formatUserResponse,
};
