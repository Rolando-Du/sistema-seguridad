const {
  listUsers,
  createSystemUser,
  updateSystemUser,
  changeUserStatus,
} = require("../services/user.service");
const { registerAuditLog } = require("../services/audit.service");

const getUsers = async (req, res, next) => {
  try {
    const users = await listUsers();

    res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await createSystemUser(req.body);

    await registerAuditLog({
      req,
      user: req.user,
      action: "CREAR",
      entity: "USUARIO",
      entityId: user.id,
      description: `El usuario ${req.user.email} creó al usuario ${user.email}.`,
      previousData: null,
      newData: user,
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado correctamente.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await updateSystemUser(req.params.id, req.body);

    await registerAuditLog({
      req,
      user: req.user,
      action: "EDITAR",
      entity: "USUARIO",
      entityId: user.id,
      description: `El usuario ${req.user.email} editó al usuario ${user.email}.`,
      previousData: null,
      newData: user,
    });

    res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await changeUserStatus({
      id: req.params.id,
      active: req.body.active,
      currentUserId: req.user.id,
    });

    await registerAuditLog({
      req,
      user: req.user,
      action: user.active ? "ACTIVAR" : "DESACTIVAR",
      entity: "USUARIO",
      entityId: user.id,
      description: user.active
        ? `El usuario ${req.user.email} activó al usuario ${user.email}.`
        : `El usuario ${req.user.email} desactivó al usuario ${user.email}.`,
      previousData: null,
      newData: user,
    });

    res.status(200).json({
      success: true,
      message: user.active
        ? "Usuario activado correctamente."
        : "Usuario desactivado correctamente.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
};
