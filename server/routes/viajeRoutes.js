import { Router } from "express";
import { createViaje, getViajeById, updateViaje, deleteViaje } from "../controllers/viajesController.js";

const router = Router();

router.post("/viajes", createViaje);
router.get("/viajes/:id", getViajeById);
router.put("/viajes/:id", updateViaje);
router.delete("/viajes/:id", deleteViaje);

export default router;
