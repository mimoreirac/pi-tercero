import { Router } from "express";
import {
  createIncidente,
  getIncidentesDelViaje,
  getMisIncidentes,
} from "../controllers/incidentesController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST /api/incidentes
// Crea un nuevo incidente para un viaje.
// Requiere autenticación.
router.post("/", protect, createIncidente);

// GET /api/incidentes/me
// Obtiene todos los incidentes reportados por el usuario autenticado.
// Requiere autenticación.
router.get("/me", protect, getMisIncidentes);

// GET /api/incidentes/viaje/:id_viaje
// Obtiene todos los incidentes de un viaje específico.
// Requiere autenticación (cualquier usuario involucrado puede verlos).
router.get("/viaje/:id_viaje", protect, getIncidentesDelViaje);

export default router;