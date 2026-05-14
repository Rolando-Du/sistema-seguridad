const auditRepository = require("../repositories/audit.repository");

const getRequestMetadata = (req) => {
  if (!req) {
    return {
      ipAddress: null,
      userAgent: null,
    };
  }

  return {
    ipAddress:
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      null,
    userAgent: req.headers["user-agent"] || null,
  };
};

const registerAuditLog = async ({
  req,
  user,
  action,
  entity,
  entityId = null,
  description,
  previousData = null,
  newData = null,
}) => {
  try {
    const metadata = getRequestMetadata(req);

    return await auditRepository.createAuditLog({
      userId: user?.id || null,
      userName: user?.name || null,
      userEmail: user?.email || null,
      userRole: user?.role || null,
      action,
      entity,
      entityId,
      description,
      previousData,
      newData,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  } catch (error) {
    console.error("⚠️ No se pudo registrar auditoría:", error.message);
    return null;
  }
};

const listAuditLogs = async (filters = {}) => {
  return auditRepository.findAuditLogs({
    action: filters.action,
    entity: filters.entity,
    user: filters.user,
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit,
  });
};

module.exports = {
  registerAuditLog,
  listAuditLogs,
};
