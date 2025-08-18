import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createReserva,
  getReservaByViaje,
  updateReservaStatus,
  cancelReserva,
} from "../controllers/reservasController.js";

const router = Router();

// Crear una reserva para un viaje
router.post("/", protect, createReserva);

// Obtener todas las reservas de un viaje
router.get("/viaje/:id", protect, getReservaByViaje);

// Obtener mi reserva en un viaje
// router.get("/viaje/:id/me", protect, getMyReserva);

// Actualizar el estado de una reserva (conductor)
router.put("/:id_reserva/estado", protect, updateReservaStatus);

// Cancelar una reserva (pasajero)
router.put("/:id_reserva/cancelar", protect, cancelReserva);

export default router;
