const express = require("express");
const auditController = require("../controllers/audit.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.get("/", auditController.getAuditLogs);

module.exports = router;
