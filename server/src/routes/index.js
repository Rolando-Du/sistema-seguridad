const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const auditRoutes = require("./audit.routes");
const incidentRoutes = require("./incident.routes");
const baseRoutes = require("./base.routes");
const dashboardRoutes = require("./dashboard.routes");
const reportRoutes = require("./report.routes");
const testRoutes = require("./test.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    server: "online",
    message: "API Sistema de Seguridad Nacional funcionando correctamente.",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/audit", auditRoutes);
router.use("/incidents", incidentRoutes);
router.use("/bases", baseRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/test", testRoutes);

module.exports = router;
