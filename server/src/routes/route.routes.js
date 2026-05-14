const express = require("express");
const routeController = require("../controllers/route.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/incidents/:incidentId/nearest-base",
  roleMiddleware("ADMIN", "OPERADOR", "LECTOR"),
  routeController.getNearestBase
);

module.exports = router;
