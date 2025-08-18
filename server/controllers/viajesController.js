import Viaje from "../models/Viajes.js";
import Usuario from "../models/Usuario.js";

export const createViaje = async (req, res) => {
  try {
    console.log("UID de usuario:", req.user?.uid);
    const firebaseUid = req.user.uid;
    const currentUser = await Usuario.findByFirebaseUid(firebaseUid);
    console.log("Usuario actual encontrado:", currentUser);
    if (!currentUser) {
      return res
        .status(403)
        .json({ error: "Usuario no encontrado para crear el viaje." });
    }

    console.log("Request body:", req.body);

    // Hacemos que el id_conductor sea el usuario actual
    const viajeData = { ...req.body, id_conductor: currentUser.id_usuario };
    console.log("Datos para crear:", viajeData);

    const newViaje = await Viaje.create(viajeData);
    console.log("Viaje creado correctamente", newViaje);
    res.status(201).json(newViaje);
  } catch (error) {
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    res.status(500).json({ error: error.message || "Error al crear el viaje" });
  }
};

export const getViajeById = async (req, res) => {
  try {
    const viaje = await Viaje.findById(req.params.id);
    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }
    res.status(200).json(viaje);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el viaje" });
  }
};

export const getActiveViajes = async (req, res) => {
  try {
    const viajes = await Viaje.findAllActive();
    res.status(200).json(viajes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los viajes activos" });
  }
};

export const updateViaje = async (req, res) => {
  try {
    const currentUser = await Usuario.findByFirebaseUid(req.user.uid);
    const viaje = await Viaje.findById(req.params.id);

    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    if (viaje.id_conductor !== currentUser.id_usuario) {
      return res
        .status(403)
        .json({ error: "No autorizado para actualizar este viaje" });
    }

    const updatedViaje = await Viaje.update(req.params.id, req.body);
    res.status(200).json(updatedViaje);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el viaje" });
  }
};

export const deleteViaje = async (req, res) => {
  try {
    const currentUser = await Usuario.findByFirebaseUid(req.user.uid);
    const viaje = await Viaje.findById(req.params.id);

    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    if (viaje.id_conductor !== currentUser.id_usuario) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar este viaje" });
    }

    await Viaje.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el viaje" });
  }
};

export const getMyViajes = async (req, res) => {
  try {
    const currentUser = await Usuario.findByFirebaseUid(req.user.uid);
    if (!currentUser) {
      return res.status(404).json({ error: "No existe el usuario" });
    }

    const myViajes = await Viaje.findByUser(currentUser.id_usuario);
    res.status(200).json(myViajes);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar viajes" });
  }
};
