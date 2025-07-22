import pool from "../db.js";
import bcrypt from "bcrypt";

class Usuario {
  static async create({ email, nombre, numero_telefono, password }) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    try {
      const result = await pool.query(
        "INSERT INTO usuarios (email, nombre, numero_telefono, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, nombre, numero_telefono, password_hash]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        // Para manejo de errores de los campos UNIQUE
        throw new Error(`El ${error.constraint.includes("email") ? "email" : "número de teléfono"} ya está en uso.`);
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

  static async update(id, { nombre, numero_telefono }) {
    const result = await pool.query(
      "UPDATE usuarios SET nombre = $1, numero_telefono = $2, updated_at = NOW() WHERE id_usuario = $3 RETURNING *",
      [nombre, numero_telefono, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

export default Usuario;
