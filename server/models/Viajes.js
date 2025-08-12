import pool from "../db.js";

class Viaje {
  static async create({
    id_conductor,
    origen,
    destino,
    hora_salida,
    asientos_disponibles,
    descripcion = null,
    estado = "activo",
    etiquetas_area = null,
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

  static async findAllActive() {
    const result = await pool.query(
      "SELECT * FROM viajes WHERE estado = 'activo'"
    );
    return result.rows;
  }

    static async update(id, updates) {
    const allowedFields = [
      "origen",
      "destino",
      "hora_salida",
      "asientos_disponibles",
      "descripcion",
      "estado",
      "etiquetas_area",
    ];

    const fieldsToUpdate = Object.keys(updates).filter((field) =>
      allowedFields.includes(field)
    );

    if (fieldsToUpdate.length === 0) {
      return this.findById(id); // No hay campos validos para actualizar
    }

    const setClause = fieldsToUpdate
      .map((field, index) => `"${field}" = $${index + 1}`)
      .join(", ");

    const values = fieldsToUpdate.map((field) => updates[field]);

    const query = `UPDATE viajes SET ${setClause}, updated_at = NOW() WHERE id_viaje = $${fieldsToUpdate.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);
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