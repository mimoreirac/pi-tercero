import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

describe("CRUD de viajes", () => {
  let conductorId;

  beforeAll(async () => {
    // Create a conductor for the tests
    const response = await supertest(app).post("/usuarios").send({
      email: "conductor@puce.edu.ec",
      nombre: "Conductor de Pruebas",
      numero_telefono: "0999999999",
      password: "password123",
    });
    conductorId = response.body.id_usuario;
  });

  afterAll(async () => {
    // Clean up the conductor
    await pool.query("DELETE FROM usuarios WHERE id_usuario = $1", [conductorId]);
    await pool.end();
  });

  afterEach(async () => {
    // Clean up the viajes table
    await pool.query("DELETE FROM viajes");
  });

  it("debería crear un viaje", async () => {
    const nuevoViaje = {
      id_conductor: conductorId,
      origen: "Quito",
      destino: "Guayaquil",
      hora_salida: new Date(),
      asientos_disponibles: 3,
      descripcion: "Viaje de prueba",
      estado: "activo",
      etiquetas_area: ["viaje", "prueba"],
    };

    const response = await supertest(app).post("/viajes").send(nuevoViaje);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id_viaje");
    expect(response.body.origen).toBe(nuevoViaje.origen);
  });

  it("debería obtener un viaje por su id", async () => {
    const nuevoViaje = {
      id_conductor: conductorId,
      origen: "Quito",
      destino: "Guayaquil",
      hora_salida: new Date(),
      asientos_disponibles: 3,
      descripcion: "Viaje de prueba",
      estado: "activo",
      etiquetas_area: ["viaje", "prueba"],
    };

    const viajeCreado = await supertest(app).post("/viajes").send(nuevoViaje);
    const viajeId = viajeCreado.body.id_viaje;

    const response = await supertest(app).get(`/viajes/${viajeId}`);

    expect(response.status).toBe(200);
    expect(response.body.id_viaje).toBe(viajeId);
  });

  it("debería actualizar un viaje", async () => {
    const nuevoViaje = {
      id_conductor: conductorId,
      origen: "Quito",
      destino: "Guayaquil",
      hora_salida: new Date(),
      asientos_disponibles: 3,
      descripcion: "Viaje de prueba",
      estado: "activo",
      etiquetas_area: ["viaje", "prueba"],
    };

    const viajeCreado = await supertest(app).post("/viajes").send(nuevoViaje);
    const viajeId = viajeCreado.body.id_viaje;

    const datosActualizados = {
      origen: "Cuenca",
      destino: "Manta",
      asientos_disponibles: 2,
    };

    const response = await supertest(app).put(`/viajes/${viajeId}`).send(datosActualizados);

    expect(response.status).toBe(200);
    expect(response.body.origen).toBe(datosActualizados.origen);
    expect(response.body.destino).toBe(datosActualizados.destino);
    expect(response.body.asientos_disponibles).toBe(datosActualizados.asientos_disponibles);
  });

  it("debería eliminar un viaje", async () => {
    const nuevoViaje = {
      id_conductor: conductorId,
      origen: "Quito",
      destino: "Guayaquil",
      hora_salida: new Date(),
      asientos_disponibles: 3,
      descripcion: "Viaje de prueba",
      estado: "activo",
      etiquetas_area: ["viaje", "prueba"],
    };

    const viajeCreado = await supertest(app).post("/viajes").send(nuevoViaje);
    const viajeId = viajeCreado.body.id_viaje;

    const response = await supertest(app).delete(`/viajes/${viajeId}`);

    expect(response.status).toBe(204);

    const dbViaje = await pool.query("SELECT * FROM viajes WHERE id_viaje = $1", [viajeId]);
    expect(dbViaje.rows.length).toBe(0);
  });
});
