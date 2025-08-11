import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

const request = supertest(app);

describe("User Endpoints with Firebase Auth", () => {
  const token = "mock-token";

  afterEach(async () => {
    await pool.query("DELETE FROM usuarios");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("POST /api/usuarios/sync", () => {
    it("debería crear un usuario en la base de datos si no existe", async () => {
      const newUserInfo = {
        numero_telefono: "1234567890",
      };

      const response = await request
        .post("/api/usuarios/sync")
        .set("Authorization", `Bearer ${token}`)
        .send(newUserInfo);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id_usuario");
      expect(response.body.firebase_uid).toBe("test-firebase-uid");
      expect(response.body.email).toBe("test@example.com");
      expect(response.body.nombre).toBe("Test User");

      const dbUser = await pool.query(
        "SELECT * FROM usuarios WHERE firebase_uid = $1",
        ["test-firebase-uid"]
      );
      expect(dbUser.rows.length).toBe(1);
    });

    it("debería retornar un usuario si ya existe", async () => {
      // Creamos un usuario primero
      await request
        .post("/api/usuarios/sync")
        .set("Authorization", `Bearer ${token}`)
        .send({ numero_telefono: "1234567890" });

      // Volvemos a llamar a la función sync
      const response = await request
        .post("/api/usuarios/sync")
        .set("Authorization", `Bearer ${token}`)
        .send({ numero_telefono: "1234567890" }); // Esto puede ser redundante

      expect(response.status).toBe(200);
      expect(response.body.firebase_uid).toBe("test-firebase-uid");
    });
  });

  describe("GET /api/usuarios/me", () => {
    it("debería retornar el perfil del usuario actual", async () => {
      // Creamos el usuario
      await request
        .post("/api/usuarios/sync")
        .set("Authorization", `Bearer ${token}`)
        .send({ numero_telefono: "1234567890" });

      const response = await request
        .get("/api/usuarios/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("test@example.com");
    });

    it("debería retornar 401 si no recibe un token de autentificación", async () => {
      const response = await request.get("/api/usuarios/me");
      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/usuarios/me", () => {
    it("debería actualizar el perfil del usuario actual", async () => {
      // Creamos el usuario
      await request
        .post("/api/usuarios/sync")
        .set("Authorization", `Bearer ${token}`)
        .send({ numero_telefono: "1234567890" });

      const updatedInfo = {
        nombre: "Updated Name",
        numero_telefono: "0987654321",
      };

      const response = await request
        .put("/api/usuarios/me")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedInfo);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe(updatedInfo.nombre);
      expect(response.body.numero_telefono).toBe(updatedInfo.numero_telefono);
    });
  });

  describe("DELETE /api/usuarios/me", () => {
    it("debería eliminar el perfil del usuario actual", async () => {
      // Creamos el usuario
      await request
        .post("/api/usuarios/sync")
        .set("Authorization", `Bearer ${token}`)
        .send({ numero_telefono: "1234567890" });

      const response = await request
        .delete("/api/usuarios/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);

      const dbUser = await pool.query(
        "SELECT * FROM usuarios WHERE firebase_uid = $1",
        ["test-firebase-uid"]
      );
      expect(dbUser.rows.length).toBe(0);
    });
  });
});