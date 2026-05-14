const express = require("express");
const incidentController = require("../controllers/incident.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", roleMiddleware("ADMIN", "OPERADOR", "LECTOR"), incidentController.getIncidents);
router.get("/:id", roleMiddleware("ADMIN", "OPERADOR", "LECTOR"), incidentController.getIncident);

router.post("/", roleMiddleware("ADMIN", "OPERADOR"), incidentController.createIncident);
router.put("/:id", roleMiddleware("ADMIN", "OPERADOR"), incidentController.updateIncident);
router.patch("/:id/status", roleMiddleware("ADMIN", "OPERADOR"), incidentController.updateIncidentStatus);

router.delete("/:id", roleMiddleware("ADMIN"), incidentController.deleteIncident);

module.exports = router;
