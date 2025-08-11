import Reserva from "../models/Reserva.js";
import Usuario from "../models/Usuario.js";
import Viaje from "../models/Viajes.js";

// Crear una reserva
export const createReserva = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const { id_viaje } = req.body;

    // 1. Obtiene el usuario actual
    const currentUser = await Usuario.findByFirebaseUid(firebaseUid);
    if (!currentUser) {
      return res.status(403).json({ error: "Usuario no autenticado." });
    }

    // 2. Obtiene los detalles del viaje
    const viaje = await Viaje.findById(id_viaje);
    if (!viaje) {
      return res.status(404).json({ error: "El viaje no existe." });
    }

    // 3. Chequea que el viaje se encuentre activo
    if (viaje.estado !== "activo") {
      return res
        .status(400)
        .json({
          error: "No se puede reservar en un viaje que no está activo.",
        });
    }

    // 4. Chequea que hayan asientos disponibles
    if (viaje.asientos_disponibles <= 0) {
      return res
        .status(400)
        .json({ error: "No hay asientos disponibles en este viaje." });
    }

    // 5. Previene que el conductor reserve un asiento en su propio viaje
    if (viaje.id_conductor === currentUser.id_usuario) {
      return res
        .status(400)
        .json({ error: "No puedes reservar un asiento en tu propio viaje." });
    }

    // 6. Chequea reservas duplicadas
    const existingReserva = await Reserva.findUserReservationForTrip(
      currentUser.id_usuario,
      id_viaje,
    );
    if (existingReserva.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya tienes una reserva para este viaje." });
    }

    // 7. Crea la reserva
    const reservaData = { id_viaje, id_pasajero: currentUser.id_usuario };
    const newReserva = await Reserva.create(reservaData);

    // Debemos disminuir el numero de asientos disponibles como mejora a futuro

    res.status(201).json(newReserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la reserva." });
  }
};

// Obtener todas las reservas por viaje
export const getReservaByViaje = async (req, res) => {
  try {
    const reservasViaje = await Reserva.findByViaje(req.params.id);
    if (reservasViaje.length === 0) {
      return res
        .status(404)
        .json({
          message: "No se encontraron reservas activas para este viaje.",
        });
    }
    res.status(200).json(reservasViaje);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las reservas por viaje" });
  }
};

// Actualizar estado de una reserva (conductor)
export const updateReservaStatus = async (req, res) => {
  try {
    const { id_reserva } = req.params;
    const { estado } = req.body;
    const firebaseUid = req.user.uid;

    if (!["confirmada", "rechazada"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido." });
    }

    const currentUser = await Usuario.findByFirebaseUid(firebaseUid);
    const reserva = await Reserva.findById(id_reserva);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    const viaje = await Viaje.findById(reserva.id_viaje);

    if (viaje.id_conductor !== currentUser.id_usuario) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar esta reserva." });
    }

    const updatedReserva = await Reserva.updateEstado(id_reserva, estado);
    res.status(200).json(updatedReserva);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la reserva." });
  }
};

// Cancelar una reserva (pasajero)
export const cancelReserva = async (req, res) => {
  try {
    const { id_reserva } = req.params;
    const firebaseUid = req.user.uid;

    const currentUser = await Usuario.findByFirebaseUid(firebaseUid);
    const reserva = await Reserva.findById(id_reserva);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    if (reserva.id_pasajero !== currentUser.id_usuario) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para cancelar esta reserva." });
    }

    // Solo se puede cancelar si está pendiente o confirmada
    if (!["pendiente", "confirmada"].includes(reserva.estado)) {
      return res
        .status(400)
        .json({
          error: `No se puede cancelar una reserva en estado '${reserva.estado}'.`,
        });
    }

    const updatedReserva = await Reserva.updateEstado(id_reserva, "cancelada");
    res.status(200).json(updatedReserva);
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la reserva." });
  }
};
