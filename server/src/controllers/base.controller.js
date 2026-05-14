const {
  listBases,
  getBaseById,
  createOperationalBase,
  updateOperationalBase,
  changeBaseStatus,
  deactivateOperationalBase,
} = require("../services/base.service");
const { registerAuditLog } = require("../services/audit.service");

const getBases = async (req, res, next) => {
  try {
    const result = await listBases(req.query);

    res.status(200).json({
      success: true,
      total: result.total,
      filters: result.filters,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getBase = async (req, res, next) => {
  try {
    const base = await getBaseById(req.params.id);

    res.status(200).json({
      success: true,
      data: base,
    });
  } catch (error) {
    next(error);
  }
};

const createBase = async (req, res, next) => {
  try {
    const base = await createOperationalBase(req.body);

    await registerAuditLog({
      req,
      user: req.user,
      action: "CREAR",
      entity: "BASE_OPERATIVA",
      entityId: base.id,
      description: `El usuario ${req.user.email} creó la base operativa ${base.name}.`,
      previousData: null,
      newData: base,
    });

    res.status(201).json({
      success: true,
      message: "Base operativa creada correctamente.",
      data: base,
    });
  } catch (error) {
    next(error);
  }
};

const updateBase = async (req, res, next) => {
  try {
    const { previousBase, updatedBase } = await updateOperationalBase(
      req.params.id,
      req.body
    );

    await registerAuditLog({
      req,
      user: req.user,
      action: "EDITAR",
      entity: "BASE_OPERATIVA",
      entityId: updatedBase.id,
      description: `El usuario ${req.user.email} editó la base operativa ${updatedBase.name}.`,
      previousData: previousBase,
      newData: updatedBase,
    });

    res.status(200).json({
      success: true,
      message: "Base operativa actualizada correctamente.",
      data: updatedBase,
    });
  } catch (error) {
    next(error);
  }
};

const updateBaseStatus = async (req, res, next) => {
  try {
    const { previousBase, updatedBase } = await changeBaseStatus(
      req.params.id,
      req.body.active
    );

    await registerAuditLog({
      req,
      user: req.user,
      action: updatedBase.active ? "ACTIVAR" : "DESACTIVAR",
      entity: "BASE_OPERATIVA",
      entityId: updatedBase.id,
      description: updatedBase.active
        ? `El usuario ${req.user.email} activó la base operativa ${updatedBase.name}.`
        : `El usuario ${req.user.email} desactivó la base operativa ${updatedBase.name}.`,
      previousData: previousBase,
      newData: updatedBase,
    });

    res.status(200).json({
      success: true,
      message: updatedBase.active
        ? "Base operativa activada correctamente."
        : "Base operativa desactivada correctamente.",
      data: updatedBase,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBase = async (req, res, next) => {
  try {
    const { previousBase, updatedBase } = await deactivateOperationalBase(
      req.params.id
    );

    await registerAuditLog({
      req,
      user: req.user,
      action: "DESACTIVAR",
      entity: "BASE_OPERATIVA",
      entityId: updatedBase.id,
      description: `El usuario ${req.user.email} dio de baja lógica la base operativa ${updatedBase.name}.`,
      previousData: previousBase,
      newData: updatedBase,
    });

    res.status(200).json({
      success: true,
      message: "Base operativa dada de baja correctamente.",
      data: updatedBase,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBases,
  getBase,
  createBase,
  updateBase,
  updateBaseStatus,
  deleteBase,
};
