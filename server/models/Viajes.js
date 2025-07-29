import pool from "../db.js";

class Viaje {
  static async create({
    id_conductor,
    origen,
    destino,
    hora_salida,
    asientos_disponibles,
    descripcion,
    estado,
    etiquetas_area,
  }) {
    const result = await pool.query(
      "INSERT INTO viajes (id_conductor, origen, destino, hora_salida, asientos_disponibles, descripcion, estado, etiquetas_area) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        id_conductor,
        origen,
        destino,
        hora_salida,
        asientos_disponibles,
        descripcion,
        estado,
        etiquetas_area,
      ]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM viajes WHERE id_viaje = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async update(id, { origen, destino, asientos_disponibles }) {
    const result = await pool.query(
      "UPDATE viajes SET origen = $1, destino = $2, asientos_disponibles = $3, updated_at = NOW() WHERE id_viaje = $4 RETURNING *",
      [origen, destino, asientos_disponibles, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM viajes WHERE id_viaje = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

export default Viaje;
