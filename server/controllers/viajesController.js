import Viaje from "../models/Viajes.js";

export const createViaje = async (req, res) => {
  try {
    const newViaje = await Viaje.create(req.body);
    res.status(201).json(newViaje);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el viaje" });
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

export const updateViaje = async (req, res) => {
  try {
    const updatedViaje = await Viaje.update(req.params.id, req.body);
    if (!updatedViaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }
    res.status(200).json(updatedViaje);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el viaje" });
  }
};

export const deleteViaje = async (req, res) => {
  try {
    const deletedViaje = await Viaje.delete(req.params.id);
    if (!deletedViaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el viaje" });
  }
};
