import pool from "../db.js";

class Usuario {
  static async findByFirebaseUid(firebaseUid) {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE firebase_uid = $1",
      [firebaseUid]
    );
    return result.rows[0];
  }

  static async create({ firebase_uid, email, nombre, numero_telefono }) {
    try {
      const result = await pool.query(
        "INSERT INTO usuarios (firebase_uid, email, nombre, numero_telefono) VALUES ($1, $2, $3, $4) RETURNING *",
        [firebase_uid, email, nombre, numero_telefono]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        throw new Error(
          `El ${error.constraint.includes("email") ? "email" : "número de teléfono"} ya está en uso.`
        );
      }
      throw error;
    }
  }

  static async findById(id) {
    const result = await pool.query(
      "SELECT id_usuario, email, nombre, numero_telefono, created_at, updated_at FROM usuarios WHERE id_usuario = $1",
      [id]
    );
    return result.rows[0];
  }

  static async update(firebaseUid, { nombre, numero_telefono }) {
    const result = await pool.query(
      "UPDATE usuarios SET nombre = $1, numero_telefono = $2, updated_at = NOW() WHERE firebase_uid = $3 RETURNING *",
      [nombre, numero_telefono, firebaseUid]
    );
    return result.rows[0];
  }

  static async delete(firebaseUid) {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE firebase_uid = $1 RETURNING *",
      [firebaseUid]
    );
    return result.rows[0];
  }
}

export default Usuario;
