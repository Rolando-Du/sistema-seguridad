const {
  getOperationalReport,
  exportOperationalReportCsv,
} = require("../services/report.service");
const { registerAuditLog } = require("../services/audit.service");

const getOperational = async (req, res, next) => {
  try {
    const report = await getOperationalReport(req.query);

    res.status(200).json({
      success: true,
      total: report.total,
      filters: report.filters,
      summary: report.summary,
      data: report.data,
    });
  } catch (error) {
    next(error);
  }
};

const exportOperationalCsv = async (req, res, next) => {
  try {
    const result = await exportOperationalReportCsv(req.query);

    await registerAuditLog({
      req,
      user: req.user,
      action: "EXPORTAR",
      entity: "INCIDENTE",
      entityId: null,
      description: `El usuario ${req.user.email} exportó un reporte operativo CSV con ${result.total} incidentes.`,
      previousData: null,
      newData: {
        total: result.total,
        filters: result.filters,
        filename: result.filename,
      },
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`
    );

    res.status(200).send(result.csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOperational,
  exportOperationalCsv,
};
