import {
    createIncidente,
    getIncidenteById,
    updateIncidente,
    deleteIncidente
  } from "../models/incidentes.js";
  
  export const crearIncidente = async (req, res) => {
    try {
      const nuevo = await createIncidente(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const obtenerIncidente = async (req, res) => {
    try {
      const incidente = await getIncidenteById(req.params.id);
      if (!incidente) {
        return res.status(404).json({ error: "Incidente no encontrado" });
      }
      res.json(incidente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const actualizarIncidente = async (req, res) => {
    try {
      const actualizado = await updateIncidente(req.params.id, req.body);
      if (!actualizado) {
        return res.status(404).json({ error: "Incidente no encontrado" });
      }
      res.json(actualizado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const eliminarIncidente = async (req, res) => {
    try {
      await deleteIncidente(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  