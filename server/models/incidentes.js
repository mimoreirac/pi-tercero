import pool from "../db.js";

class Incidente {
  static async create({
    id_viaje,
    id_reportador,
    tipo_incidente,
    descripcion,
  }) {
    const result = await pool.query(
      `INSERT INTO incidentes (id_viaje, id_reportador, tipo_incidente, descripcion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_viaje, id_reportador, tipo_incidente, descripcion]
    );
    return result.rows[0];
  }

  static async findByViajeId(id_viaje) {
    const result = await pool.query(
      `SELECT i.*, u.nombre as nombre_reportador
       FROM incidentes i
       JOIN usuarios u ON i.id_reportador = u.id_usuario
       WHERE i.id_viaje = $1
       ORDER BY i.created_at DESC`,
      [id_viaje]
    );
    return result.rows;
  }

  static async findByReportadorId(id_reportador) {
    const result = await pool.query(
      `SELECT i.*, v.origen, v.destino, v.hora_salida
       FROM incidentes i
       JOIN viajes v ON i.id_viaje = v.id_viaje
       WHERE i.id_reportador = $1
       ORDER BY i.created_at DESC`,
      [id_reportador]
    );
    return result.rows;
  }

  static async isUserInvolvedInViaje(id_usuario, id_viaje) {
    const result = await pool.query(
      `SELECT 
        EXISTS (
          -- Es el conductor del viaje
          SELECT 1 FROM viajes WHERE id_viaje = $1 AND id_conductor = $2
        ) OR EXISTS (
          -- Es un pasajero con reserva confirmada en el viaje
          SELECT 1 FROM reservas 
          WHERE id_viaje = $1 AND id_pasajero = $2 AND estado = 'confirmada'
        ) as is_involved`,
      [id_viaje, id_usuario]
    );
    return result.rows[0].is_involved;
  }
}

export default Incidente;
