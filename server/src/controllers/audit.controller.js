const { listAuditLogs } = require("../services/audit.service");

const getAuditLogs = async (req, res, next) => {
  try {
    const filters = {
      action: req.query.action || "TODAS",
      entity: req.query.entity || "TODAS",
      user: req.query.user || "",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
      limit: req.query.limit || 100,
    };

    const auditLogs = await listAuditLogs(filters);

    res.status(200).json({
      success: true,
      total: auditLogs.length,
      filters,
      data: auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
