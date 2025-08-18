import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

const request = supertest(app);

describe("API de Incidentes", () => {
  let conductor, pasajero, otroUsuario, viaje;
  const conductorToken = "conductor-token";
  const pasajeroToken = "pasajero-token";
  const otroUsuarioToken = "otro-token";

  beforeAll(async () => {
    // Limpiar la base de datos antes de todas las pruebas
    await pool.query("DELETE FROM incidentes");
    await pool.query("DELETE FROM reservas");
    await pool.query("DELETE FROM viajes");
    await pool.query("DELETE FROM usuarios");

    // Crear usuarios
    const conductorRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ numero_telefono: "0999999999" });
    conductor = conductorRes.body;

    const pasajeroRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send({ numero_telefono: "0987654322" });
    pasajero = pasajeroRes.body;

    const otroUsuarioRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${otroUsuarioToken}`)
      .send({ numero_telefono: "0911111111" });
    otroUsuario = otroUsuarioRes.body;
  });

  beforeEach(async () => {
    // Crear un viaje para cada prueba
    const viajeRes = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({
        origen: "Quito",
        destino: "Guayaquil",
        hora_salida: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        asientos_disponibles: 3,
      });
    viaje = viajeRes.body;

    // Crear y confirmar una reserva para vincular al pasajero con el viaje
    const reservaRes = await request
      .post("/api/reservas")
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send({ id_viaje: viaje.id_viaje });

    await request
      .put(`/api/reservas/${reservaRes.body.id_reserva}/estado`)
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ estado: "confirmada" });
  });

  afterEach(async () => {
    await pool.query("DELETE FROM incidentes");
    await pool.query("DELETE FROM reservas");
    await pool.query("DELETE FROM viajes");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM usuarios");
    await pool.end();
  });

  describe("POST /api/incidentes", () => {
    it("debería permitir a un pasajero crear un incidente para un viaje del que forma parte", async () => {
      const nuevoIncidente = {
        id_viaje: viaje.id_viaje,
        tipo_incidente: "retraso",
        descripcion: "El conductor llegó 30 minutos tarde.",
      };

      const response = await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send(nuevoIncidente);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id_incidente");
      expect(response.body.id_reportador).toBe(pasajero.id_usuario);
      expect(response.body.id_viaje).toBe(viaje.id_viaje);
    });

    it("debería permitir al conductor crear un incidente para su propio viaje", async () => {
      const nuevoIncidente = {
        id_viaje: viaje.id_viaje,
        tipo_incidente: "accidente",
        descripcion: "Tuvimos un pequeño accidente, todos están bien.",
      };

      const response = await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${conductorToken}`)
        .send(nuevoIncidente);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id_incidente");
      expect(response.body.id_reportador).toBe(conductor.id_usuario);
    });

    it("debería retornar 403 si un usuario no involucrado en el viaje intenta crear un incidente", async () => {
      const nuevoIncidente = {
        id_viaje: viaje.id_viaje,
        tipo_incidente: "otro",
        descripcion: "Intento de reporte de incidente.",
      };

      const response = await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${otroUsuarioToken}`)
        .send(nuevoIncidente);

      expect(response.status).toBe(403);
    });

    it("debería retornar 400 para un tipo de incidente no válido", async () => {
      const nuevoIncidente = {
        id_viaje: viaje.id_viaje,
        tipo_incidente: "tipo_invalido",
        descripcion: "Esto no debería funcionar.",
      };

      const response = await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send(nuevoIncidente);

      expect(response.status).toBe(400);
    });

    it("debería retornar 400 si falta la descripción", async () => {
      const nuevoIncidente = {
        id_viaje: viaje.id_viaje,
        tipo_incidente: "retraso",
      };

      const response = await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send(nuevoIncidente);

      expect(response.status).toBe(400);
    });

    it("debería retornar 404 si el viaje no existe", async () => {
        const nonExistentViajeId = 99999;
        const nuevoIncidente = {
            id_viaje: nonExistentViajeId,
            tipo_incidente: "retraso",
            descripcion: "Viaje no existe",
        };

        const response = await request
            .post("/api/incidentes")
            .set("Authorization", `Bearer ${pasajeroToken}`)
            .send(nuevoIncidente);

        expect(response.status).toBe(404);
    });
  });

  describe("GET /api/incidentes/viaje/:id_viaje", () => {
    it("debería retornar todos los incidentes de un viaje específico", async () => {
      // Pasajero crea un incidente
      await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({
          id_viaje: viaje.id_viaje,
          tipo_incidente: "retraso",
          descripcion: "El conductor llegó tarde.",
        });

      // Conductor crea otro incidente
      await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({
          id_viaje: viaje.id_viaje,
          tipo_incidente: "comportamiento",
          descripcion: "Un pasajero se comportó mal.",
        });

      const response = await request
        .get(`/api/incidentes/viaje/${viaje.id_viaje}`)
        .set("Authorization", `Bearer ${pasajeroToken}`); // Cualquier usuario autenticado puede ver

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    it("debería retornar un array vacío si no existen incidentes para el viaje", async () => {
      const response = await request
        .get(`/api/incidentes/viaje/${viaje.id_viaje}`)
        .set("Authorization", `Bearer ${pasajeroToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("debería retornar 404 si el viaje no existe", async () => {
        const nonExistentViajeId = 99999;
        const response = await request
            .get(`/api/incidentes/viaje/${nonExistentViajeId}`)
            .set("Authorization", `Bearer ${pasajeroToken}`);
        expect(response.status).toBe(404);
    });
  });

  describe("GET /api/incidentes/me", () => {
    it("debería retornar todos los incidentes reportados por el usuario autenticado", async () => {
      // Incidente del pasajero
      await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({
          id_viaje: viaje.id_viaje,
          tipo_incidente: "retraso",
          descripcion: "El conductor llegó tarde.",
        });

      // Incidente del conductor (no deberia aparecer en la consulta del pasajero)
      await request
        .post("/api/incidentes")
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({
          id_viaje: viaje.id_viaje,
          tipo_incidente: "comportamiento",
          descripcion: "Un pasajero se comportó mal.",
        });

      const response = await request
        .get("/api/incidentes/me")
        .set("Authorization", `Bearer ${pasajeroToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id_reportador).toBe(pasajero.id_usuario);
    });

    it("debería retornar un array vacío si el usuario no ha reportado incidentes", async () => {
      const response = await request
        .get("/api/incidentes/me")
        .set("Authorization", `Bearer ${pasajeroToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("debería retornar 401 si el usuario no está autenticado", async () => {
        const response = await request.get("/api/incidentes/me");
        expect(response.status).toBe(401);
    });
  });
});