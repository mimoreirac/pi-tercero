import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

describe("CRUD de incidentes", () => {
  let conductorId;
  let pasajeroId;
  let viajeId;

  beforeAll(async () => {
    // Create a conductor and a pasajero for the tests
    const conductorResponse = await supertest(app).post("/usuarios").send({
      email: "conductor@puce.edu.ec",
      nombre: "Conductor de Pruebas",
      numero_telefono: "0999999999",
      password: "password123",
    });
    conductorId = conductorResponse.body.id_usuario;

    const pasajeroResponse = await supertest(app).post("/usuarios").send({
      email: "pasajero@puce.edu.ec",
      nombre: "Pasajero de Pruebas",
      numero_telefono: "0987654321",
      password: "password123",
    });
    pasajeroId = pasajeroResponse.body.id_usuario;

    // Create a viaje for the tests
    const viajeResponse = await supertest(app).post("/viajes").send({
      id_conductor: conductorId,
      origen: "Quito",
      destino: "Guayaquil",
      hora_salida: new Date(),
      asientos_disponibles: 3,
      descripcion: "Viaje de prueba",
      estado: "activo",
      etiquetas_area: ["viaje", "prueba"],
    });
    viajeId = viajeResponse.body.id_viaje;
  });

  afterAll(async () => {
    // Clean up the database
    await pool.query("DELETE FROM incidentes");
    await pool.query("DELETE FROM viajes");
    await pool.query("DELETE FROM usuarios");
    await pool.end();
  });

  afterEach(async () => {
    // Clean up the incidentes table
    await pool.query("DELETE FROM incidentes");
  });

  it("debería crear un incidente", async () => {
    const nuevoIncidente = {
      id_viaje: viajeId,
      id_reportador: pasajeroId,
      tipo_incidente: "retraso",
      descripcion: "El conductor llegó tarde",
    };

    const response = await supertest(app).post("/incidentes").send(nuevoIncidente);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id_incidente");
    expect(response.body.id_viaje).toBe(nuevoIncidente.id_viaje);
    expect(response.body.id_reportador).toBe(nuevoIncidente.id_reportador);
  });

  it("debería obtener un incidente por su id", async () => {
    const nuevoIncidente = {
      id_viaje: viajeId,
      id_reportador: pasajeroId,
      tipo_incidente: "retraso",
      descripcion: "El conductor llegó tarde",
    };

    const incidenteCreado = await supertest(app).post("/incidentes").send(nuevoIncidente);
    const incidenteId = incidenteCreado.body.id_incidente;

    const response = await supertest(app).get(`/incidentes/${incidenteId}`);

    expect(response.status).toBe(200);
    expect(response.body.id_incidente).toBe(incidenteId);
  });

  it("debería actualizar un incidente", async () => {
    const nuevoIncidente = {
      id_viaje: viajeId,
      id_reportador: pasajeroId,
      tipo_incidente: "retraso",
      descripcion: "El conductor llegó tarde",
    };

    const incidenteCreado = await supertest(app).post("/incidentes").send(nuevoIncidente);
    const incidenteId = incidenteCreado.body.id_incidente;

    const datosActualizados = {
      tipo_incidente: "otro",
      descripcion: "El conductor no llegó",
      estado: "en_revision",
    };

    const response = await supertest(app).put(`/incidentes/${incidenteId}`).send(datosActualizados);

    expect(response.status).toBe(200);
    expect(response.body.tipo_incidente).toBe(datosActualizados.tipo_incidente);
    expect(response.body.descripcion).toBe(datosActualizados.descripcion);
    expect(response.body.estado).toBe(datosActualizados.estado);
  });

  it("debería eliminar un incidente", async () => {
    const nuevoIncidente = {
      id_viaje: viajeId,
      id_reportador: pasajeroId,
      tipo_incidente: "retraso",
      descripcion: "El conductor llegó tarde",
    };

    const incidenteCreado = await supertest(app).post("/incidentes").send(nuevoIncidente);
    const incidenteId = incidenteCreado.body.id_incidente;

    const response = await supertest(app).delete(`/incidentes/${incidenteId}`);

    expect(response.status).toBe(204);

    const dbIncidente = await pool.query("SELECT * FROM incidentes WHERE id_incidente = $1", [incidenteId]);
    expect(dbIncidente.rows.length).toBe(0);
  });
});
