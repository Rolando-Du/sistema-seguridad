const express = require("express");
const baseController = require("../controllers/base.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", roleMiddleware("ADMIN", "OPERADOR", "LECTOR"), baseController.getBases);
router.get("/:id", roleMiddleware("ADMIN", "OPERADOR", "LECTOR"), baseController.getBase);

router.post("/", roleMiddleware("ADMIN"), baseController.createBase);
router.put("/:id", roleMiddleware("ADMIN"), baseController.updateBase);
router.patch("/:id/status", roleMiddleware("ADMIN"), baseController.updateBaseStatus);
router.delete("/:id", roleMiddleware("ADMIN"), baseController.deleteBase);

module.exports = router;
