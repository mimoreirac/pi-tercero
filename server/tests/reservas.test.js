import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

const request = supertest(app);

describe("CRUD de reservas", () => {
  let conductorId, pasajeroId, viajeId;
  const conductorToken = "conductor-token";
  const pasajeroToken = "pasajero-token";

  beforeAll(async () => {
    const conductorRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ numero_telefono: "0999999998" });
    conductorId = conductorRes.body.id_usuario;

    const pasajeroRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send({ numero_telefono: "0987654321" });
    pasajeroId = pasajeroRes.body.id_usuario;

    // Crea un viaje de pruebas
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
    await pool.query("DELETE FROM reservas");
    await pool.query("DELETE FROM viajes");
    await pool.query("DELETE FROM usuarios");
    await pool.end();
  });

  afterEach(async () => {
    await pool.query("DELETE FROM reservas");
  });

  it("debería crear una reserva", async () => {
    const nuevaReserva = {
      id_viaje: viajeId,
      id_pasajero: pasajeroId,
      estado: "pendiente",
    };

    const response = await request
      .post("/api/reservas")
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send(nuevaReserva);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id_reserva");
  });

});