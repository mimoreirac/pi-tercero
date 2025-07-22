import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import bcrypt from "bcrypt";
import app from "../server.js";
import pool from "../db.js";

const request = supertest(app);

describe("CRUD de usuarios", () => {
  let userId;

  beforeAll(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        numero_telefono VARCHAR(10) UNIQUE NOT NULL,
        password_hash VARCHAR(60) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  });

  afterEach(async () => {
    await pool.query("DELETE FROM usuarios");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("debería crear un usuario con una contraseña cifrada", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);

    const nuevoUsuario = {
      email: "test@puce.edu.ec",
      nombre: "Usuario Pruebas",
      numero_telefono: "1234567890",
      password: password,
    };

    const response = await request.post("/usuarios").send(nuevoUsuario);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id_usuario");
    userId = response.body.id_usuario;

    const dbUser = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = $1",
      [userId]
    );
    expect(dbUser.rows.length).toBe(1);
    expect(dbUser.rows[0].email).toBe(nuevoUsuario.email);
    const isPasswordCorrect = await bcrypt.compare(
      password,
      dbUser.rows[0].password_hash
    );
    expect(isPasswordCorrect).toBe(true);
  });

  it("no debería crear un usuario si el email ya existe", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO usuarios (email, nombre, numero_telefono, password_hash) VALUES ($1, $2, $3, $4)",
      ["test@puce.edu.ec", "Usuario Existente", "1234567890", hashedPassword]
    );

    const nuevoUsuario = {
      email: "test@puce.edu.ec",
      nombre: "Otro Usuario",
      numero_telefono: "0987654321",
      password: "newpassword",
    };

    const response = await request.post("/usuarios").send(nuevoUsuario);

    expect(response.status).toBe(409);
  });

  it("no debería crear un usuario si el número de teléfono ya existe", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO usuarios (email, nombre, numero_telefono, password_hash) VALUES ($1, $2, $3, $4)",
      ["test1@puce.edu.ec", "Usuario Existente", "1234567890", hashedPassword]
    );

    const nuevoUsuario = {
      email: "test2@puce.edu.ec",
      nombre: "Otro Usuario",
      numero_telefono: "1234567890",
      password: "newpassword",
    };

    const response = await request.post("/usuarios").send(nuevoUsuario);

    expect(response.status).toBe(409);
  });

  it("debería obtener un usuario utilizando su id", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);
    const usuario = await pool.query(
      "INSERT INTO usuarios (email, nombre, numero_telefono, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
      ["usuariotest@puce.edu.ec", "Usuario Test", "0987654321", hashedPassword]
    );
    userId = usuario.rows[0].id_usuario;

    const response = await request.get(`/usuarios/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("usuariotest@puce.edu.ec");
    expect(response.body).not.toHaveProperty("password_hash");
  });

  it("debería actualizar la información de un usuario", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await pool.query(
      "INSERT INTO usuarios (email, nombre, numero_telefono, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
      ["testactualizar@puce.edu.ec", "Actualizar Usuario", "1122334455", hashedPassword]
    );
    userId = user.rows[0].id_usuario;

    const updatedInfo = {
      nombre: "Usuario Actualizado",
      numero_telefono: "5544332211",
    };

    const response = await request.put(`/usuarios/${userId}`).send(updatedInfo);

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe(updatedInfo.nombre);
    expect(response.body.numero_telefono).toBe(updatedInfo.numero_telefono);

    const dbUser = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = $1",
      [userId]
    );
    expect(dbUser.rows[0].nombre).toBe(updatedInfo.nombre);
  });

  it("debería eliminar un usuario", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await pool.query(
      "INSERT INTO usuarios (email, nombre, numero_telefono, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
      ["borrarusuario@puce.edu.ec", "Borrar Usuario", "1231231234", hashedPassword]
    );
    userId = user.rows[0].id_usuario;

    const response = await request.delete(`/usuarios/${userId}`);

    expect(response.status).toBe(204);

    const dbUser = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = $1",
      [userId]
    );
    expect(dbUser.rows.length).toBe(0);
  });
});
