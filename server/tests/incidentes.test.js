import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

const request = supertest(app);

describe("CRUD de incidentes", () => {
  let conductorId, pasajeroId, viajeId;
  const conductorToken = "conductor-token";
  const pasajeroToken = "pasajero-token";

  beforeAll(async () => {
    const conductorRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ numero_telefono: "0999999999" });
    conductorId = conductorRes.body.id_usuario;

    const pasajeroRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send({ numero_telefono: "0987654322" });
    pasajeroId = pasajeroRes.body.id_usuario;

    const viajeRes = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({
        id_conductor: conductorId,
        origen: "Quito",
        destino: "Guayaquil",
        hora_salida: new Date(),
        asientos_disponibles: 3,
      });
    viajeId = viajeRes.body.id_viaje;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM incidentes");
    await pool.query("DELETE FROM viajes");
    await pool.query("DELETE FROM usuarios");
    await pool.end();
  });

  afterEach(async () => {
    await pool.query("DELETE FROM incidentes");
  });

  it("debería crear un incidente", async () => {
    const nuevoIncidente = {
      id_viaje: viajeId,
      id_reportador: pasajeroId,
      tipo_incidente: "retraso",
      descripcion: "El conductor llegó tarde",
    };

    const response = await request
      .post("/api/incidentes")
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send(nuevoIncidente);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id_incidente");
  });

});