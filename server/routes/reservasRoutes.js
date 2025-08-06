import express from "express";
import Reserva from "../models/Reserva.js";

const router = express.Router();

// Crear una reserva
router.post("/", async (req, res) => {
  try {
    const { id_viaje, id_pasajero } = req.body;
    const nuevaReserva = await Reserva.create({ id_viaje, id_pasajero });
    res.status(201).json(nuevaReserva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todas las reservas
router.get("/", async (req, res) => {
  try {
    const reservas = await Reserva.findAll();
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;