const userRepository = require("../repositories/user.repository");
const { hashPassword } = require("../utils/password");

const allowedRoles = ["ADMIN", "OPERADOR", "LECTOR"];

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const formatName = (name) => {
  return String(name || "").trim();
};

const listUsers = async () => {
  return userRepository.findAllUsers();
};

const createSystemUser = async ({
  name,
  email,
  password,
  role,
  active = true,
}) => {
  const cleanName = formatName(name);
  const cleanEmail = normalizeEmail(email);
  const cleanRole = String(role || "LECTOR")
    .trim()
    .toUpperCase();

  if (cleanName.length < 3 || cleanName.length > 100) {
    const error = new Error("El nombre debe tener entre 3 y 100 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    const error = new Error("El email ingresado no es válido.");
    error.statusCode = 400;
    throw error;
  }

  if (!password || String(password).length < 6) {
    const error = new Error("La contraseña debe tener al menos 6 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  if (!allowedRoles.includes(cleanRole)) {
    const error = new Error("El rol seleccionado no es válido.");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await userRepository.findUserByEmail(cleanEmail);

  if (existingUser) {
    const error = new Error("Ya existe un usuario registrado con ese email.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  return userRepository.createUser({
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: cleanRole,
    active: Boolean(active),
  });
};

const updateSystemUser = async (id, data) => {
  const user = await userRepository.findUserById(id);

  if (!user) {
    const error = new Error("Usuario no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.name !== undefined) {
    const cleanName = formatName(data.name);

    if (cleanName.length < 3 || cleanName.length > 100) {
      const error = new Error("El nombre debe tener entre 3 y 100 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    updateData.name = cleanName;
  }

  if (data.email !== undefined) {
    const cleanEmail = normalizeEmail(data.email);

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const error = new Error("El email ingresado no es válido.");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await userRepository.findUserByEmail(cleanEmail);

    if (existingUser && existingUser.id !== id) {
      const error = new Error("Ya existe otro usuario con ese email.");
      error.statusCode = 409;
      throw error;
    }

    updateData.email = cleanEmail;
  }

  if (data.role !== undefined) {
    const cleanRole = String(data.role || "")
      .trim()
      .toUpperCase();

    if (!allowedRoles.includes(cleanRole)) {
      const error = new Error("El rol seleccionado no es válido.");
      error.statusCode = 400;
      throw error;
    }

    updateData.role = cleanRole;
  }

  if (data.password) {
    if (String(data.password).length < 6) {
      const error = new Error(
        "La nueva contraseña debe tener al menos 6 caracteres.",
      );
      error.statusCode = 400;
      throw error;
    }

    updateData.passwordHash = await hashPassword(data.password);
  }

  if (data.active !== undefined) {
    updateData.active = Boolean(data.active);
  }

  return userRepository.updateUser(id, updateData);
};

const changeUserStatus = async ({ id, active, currentUserId }) => {
  if (typeof active !== "boolean") {
    const error = new Error("El estado active debe ser true o false.");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findUserById(id);

  if (!user) {
    const error = new Error("Usuario no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (id === currentUserId && active === false) {
    const error = new Error("No podés desactivar tu propio usuario.");
    error.statusCode = 400;
    throw error;
  }

  return userRepository.updateUser(id, {
    active,
  });
};

module.exports = {
  listUsers,
  createSystemUser,
  updateSystemUser,
  changeUserStatus,
};
