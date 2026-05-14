const {
  listIncidents,
  getIncidentById,
  createSystemIncident,
  updateSystemIncident,
  changeIncidentStatus,
  removeSystemIncident,
} = require("../services/incident.service");
const { registerAuditLog } = require("../services/audit.service");

const getIncidents = async (req, res, next) => {
  try {
    const result = await listIncidents(req.query);

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

const getIncident = async (req, res, next) => {
  try {
    const incident = await getIncidentById(req.params.id);

    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

const createIncident = async (req, res, next) => {
  try {
    const incident = await createSystemIncident(req.body, req.user);

    await registerAuditLog({
      req,
      user: req.user,
      action: "CREAR",
      entity: "INCIDENTE",
      entityId: incident.id,
      description: `El usuario ${req.user.email} creó un incidente de tipo ${incident.crimeType}.`,
      previousData: null,
      newData: incident,
    });

    res.status(201).json({
      success: true,
      message: "Incidente creado correctamente.",
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

const updateIncident = async (req, res, next) => {
  try {
    const { previousIncident, updatedIncident } = await updateSystemIncident(
      req.params.id,
      req.body
    );

    await registerAuditLog({
      req,
      user: req.user,
      action: "EDITAR",
      entity: "INCIDENTE",
      entityId: updatedIncident.id,
      description: `El usuario ${req.user.email} editó el incidente ${updatedIncident.id}.`,
      previousData: previousIncident,
      newData: updatedIncident,
    });

    res.status(200).json({
      success: true,
      message: "Incidente actualizado correctamente.",
      data: updatedIncident,
    });
  } catch (error) {
    next(error);
  }
};

const updateIncidentStatus = async (req, res, next) => {
  try {
    const { previousIncident, updatedIncident } = await changeIncidentStatus(
      req.params.id,
      req.body.status
    );

    await registerAuditLog({
      req,
      user: req.user,
      action: "CAMBIAR_ESTADO",
      entity: "INCIDENTE",
      entityId: updatedIncident.id,
      description: `El usuario ${req.user.email} cambió el estado del incidente ${updatedIncident.id}.`,
      previousData: previousIncident,
      newData: updatedIncident,
    });

    res.status(200).json({
      success: true,
      message: "Estado del incidente actualizado correctamente.",
      data: updatedIncident,
    });
  } catch (error) {
    next(error);
  }
};

const deleteIncident = async (req, res, next) => {
  try {
    const { previousIncident, deletedIncident } = await removeSystemIncident(
      req.params.id
    );

    await registerAuditLog({
      req,
      user: req.user,
      action: "ELIMINAR",
      entity: "INCIDENTE",
      entityId: deletedIncident.id,
      description: `El usuario ${req.user.email} eliminó el incidente ${deletedIncident.id}.`,
      previousData: previousIncident,
      newData: null,
    });

    res.status(200).json({
      success: true,
      message: "Incidente eliminado correctamente.",
      data: deletedIncident,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  updateIncidentStatus,
  deleteIncident,
};
