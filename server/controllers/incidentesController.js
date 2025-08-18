import Incidente from "../models/incidentes.js";
import Viaje from "../models/Viajes.js";
import Usuario from "../models/Usuario.js";

const TIPOS_INCIDENTE_VALIDOS = [
  "retraso",
  "accidente",
  "comportamiento",
  "otro",
  "cancelacion",
];

export const createIncidente = async (req, res) => {
  try {
    const { id_viaje, tipo_incidente, descripcion } = req.body;
    const firebaseUid = req.user.uid;

    // 1. Validar datos de entrada
    if (!id_viaje || !tipo_incidente || !descripcion) {
      return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    if (!TIPOS_INCIDENTE_VALIDOS.includes(tipo_incidente)) {
      return res.status(400).json({ error: "Tipo de incidente no válido." });
    }

    // 2. Obtener usuario
    const reportador = await Usuario.findByFirebaseUid(firebaseUid);
    if (!reportador) {
      return res.status(403).json({ error: "Usuario no autenticado." });
    }
    const id_reportador = reportador.id_usuario;

    // 3. Verificar que el viaje existe
    const viaje = await Viaje.findById(id_viaje);
    if (!viaje) {
      return res.status(404).json({ error: "El viaje especificado no existe." });
    }

    // 4. Verificar que el usuario esté involucrado en el viaje
    const isUserInvolved = await Incidente.isUserInvolvedInViaje(
      id_reportador,
      id_viaje
    );
    if (!isUserInvolved) {
      return res
        .status(403)
        .json({ error: "No autorizado para reportar incidentes en este viaje." });
    }

    // 5. Crear el incidente
    const nuevoIncidente = await Incidente.create({
      id_viaje,
      id_reportador,
      tipo_incidente,
      descripcion,
    });

    res.status(201).json(nuevoIncidente);
  } catch (error) {
    console.error("Error en createIncidente:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getIncidentesDelViaje = async (req, res) => {
  const { id_viaje } = req.params;

  try {
    // 1. Verificar que el viaje existe para dar una respuesta 404 adecuada
    const viaje = await Viaje.findById(id_viaje);
    if (!viaje) {
      return res.status(404).json({ error: "El viaje no fue encontrado." });
    }

    // 2. Obtener los incidentes
    const incidentes = await Incidente.findByViajeId(id_viaje);
    res.status(200).json(incidentes);
  } catch (error) {
    console.error("Error al obtener incidentes del viaje:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getMisIncidentes = async (req, res) => {
  try {
    const reportador = await Usuario.findByFirebaseUid(req.user.uid);
    if (!reportador) {
      return res.status(403).json({ error: "Usuario no autenticado." });
    }
    const id_reportador = reportador.id_usuario;

    const incidentes = await Incidente.findByReportadorId(id_reportador);
    res.status(200).json(incidentes);
  } catch (error) {
    console.error("Error al obtener mis incidentes:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
