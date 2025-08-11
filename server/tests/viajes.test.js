import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

const request = supertest(app);

describe("CRUD de viajes seguro", () => {
  let conductorId, pasajeroId;
  const conductorToken = "conductor-token";
  const pasajeroToken = "pasajero-token";

  beforeAll(async () => {
    // Hace sync al conductor y pasajero
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
  });

  afterAll(async () => {
    await pool.query("DELETE FROM viajes");
    await pool.query("DELETE FROM usuarios");
    await pool.end();
  });

  afterEach(async () => {
    await pool.query("DELETE FROM viajes");
  });

  it("debería crear un viaje con el id_conductor del usuario autenticado", async () => {
    const nuevoViaje = {
      origen: "Quito",
      destino: "Guayaquil",
      hora_salida: new Date(),
      asientos_disponibles: 3,
    };

    const response = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send(nuevoViaje);

    expect(response.status).toBe(201);
    expect(response.body.id_conductor).toBe(conductorId);
  });

  it("debería obtener un viaje por su id si está autenticado", async () => {
    const viajeCreado = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ origen: "Origen", destino: "Destino", hora_salida: new Date(), asientos_disponibles: 1 });
    const viajeId = viajeCreado.body.id_viaje;

    const response = await request
      .get(`/api/viajes/${viajeId}`)
      .set("Authorization", `Bearer ${pasajeroToken}`); // Cualquier usuario autentificado puede ver los viajes

    expect(response.status).toBe(200);
    expect(response.body.id_viaje).toBe(viajeId);
  });

  it("debería permitir al conductor actualizar su propio viaje", async () => {
    const viajeCreado = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ origen: "Origen", destino: "Destino", hora_salida: new Date(), asientos_disponibles: 1 });
    const viajeId = viajeCreado.body.id_viaje;

    const datosActualizados = { origen: "Nuevo Origen", destino: "Nuevo Destino", hora_salida: "2025-08-06 14:30:00", asientos_disponibles: 3 };
    const response = await request
      .put(`/api/viajes/${viajeId}`)
      .set("Authorization", `Bearer ${conductorToken}`)
      .send(datosActualizados);

    expect(response.status).toBe(200);
    expect(response.body.origen).toBe("Nuevo Origen");
    expect(response.body.destino).toBe("Nuevo Destino");
    expect(response.body.asientos_disponibles).toBe(3);
  });

  it("no debería permitir a otro usuario actualizar el viaje", async () => {
    const viajeCreado = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ origen: "Origen", destino: "Destino", hora_salida: new Date(), asientos_disponibles: 1 });
    const viajeId = viajeCreado.body.id_viaje;

    const datosActualizados = { origen: "Intento Malicioso" };
    const response = await request
      .put(`/api/viajes/${viajeId}`)
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send(datosActualizados);

    expect(response.status).toBe(403);
  });

  it("debería permitir al conductor eliminar su propio viaje", async () => {
    const viajeCreado = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ origen: "Origen", destino: "Destino", hora_salida: new Date(), asientos_disponibles: 1 });
    const viajeId = viajeCreado.body.id_viaje;

    const response = await request
      .delete(`/api/viajes/${viajeId}`)
      .set("Authorization", `Bearer ${conductorToken}`);

    expect(response.status).toBe(204);
  });

  it("no debería permitir a otro usuario eliminar el viaje", async () => {
    const viajeCreado = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ origen: "Origen", destino: "Destino", hora_salida: new Date(), asientos_disponibles: 1 });
    const viajeId = viajeCreado.body.id_viaje;

    const response = await request
      .delete(`/api/viajes/${viajeId}`)
      .set("Authorization", `Bearer ${pasajeroToken}`);

    expect(response.status).toBe(403);
  });
});
