const express = require("express");
const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/operational",
  roleMiddleware("ADMIN", "OPERADOR"),
  reportController.getOperational
);

router.get(
  "/operational/export/csv",
  roleMiddleware("ADMIN", "OPERADOR"),
  reportController.exportOperationalCsv
);

module.exports = router;
