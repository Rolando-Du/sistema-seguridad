const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.get("/db", async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalIncidents = await prisma.incident.count();
    const totalBases = await prisma.operationalBase.count();
    const totalAuditLogs = await prisma.auditLog.count();

    res.status(200).json({
      success: true,
      message: "Conexión a PostgreSQL mediante Prisma funcionando.",
      data: {
        users: totalUsers,
        incidents: totalIncidents,
        operationalBases: totalBases,
        auditLogs: totalAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;