import pool from "../db.js";

class Reserva {
  static async create({ id_viaje, id_pasajero }) {
    const result = await pool.query(
      "INSERT INTO reservas (id_viaje, id_pasajero, estado, created_at) VALUES ($1, $2, 'pendiente', NOW()) RETURNING *",
      [id_viaje, id_pasajero]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      "SELECT * FROM reservas WHERE id_reserva = $1",
      [id]
    );
    return result.rows[0];
  }

  static async updateEstado(id, nuevoEstado) {
    const result = await pool.query(
      "UPDATE reservas SET estado = $1, updated_at = NOW() WHERE id_reserva = $2 RETURNING *",
      [nuevoEstado, id]
    );
    return result.rows[0];
  }

  static async findByViaje(id_viaje) {
    const result = await pool.query(
      "SELECT * FROM reservas WHERE id_viaje = $1 AND estado NOT IN ('rechazada', 'cancelada')",
      [id_viaje]
    );
    return result.rows;
  }

  static async findUserReservationForTrip(id_pasajero, id_viaje) {
    const result = await pool.query(
      "SELECT * FROM reservas WHERE id_pasajero = $1 AND id_viaje = $2 AND estado NOT IN ('rechazada', 'cancelada')",
      [id_pasajero, id_viaje]
    );
    return result.rows;
  }

  static async findAll() {
    const result = await pool.query("SELECT * FROM reservas");
    return result.rows;
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM reservas WHERE id_reserva = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

export default Reserva;
