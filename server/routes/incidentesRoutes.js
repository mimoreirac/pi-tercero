import { Router } from "express";
import {
  crearIncidente,
  obtenerIncidente,
  actualizarIncidente,
  eliminarIncidente
} from "../controllers/incidentesController.js";

const router = Router();

router.post("/", crearIncidente);
router.get("/:id", obtenerIncidente);
router.put("/:id", actualizarIncidente);
router.delete("/:id", eliminarIncidente);

export default router;
