import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

const request = supertest(app);

describe("Reservas endpoints", () => {
  let conductor, pasajero, viaje;
  const conductorToken = "conductor-token";
  const pasajeroToken = "pasajero-token";

  beforeAll(async () => {
    // Crea usuarios para los tests
    const conductorRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({ numero_telefono: "0999999998" });
    conductor = conductorRes.body;

    const pasajeroRes = await request
      .post("/api/usuarios/sync")
      .set("Authorization", `Bearer ${pasajeroToken}`)
      .send({ numero_telefono: "0987654321" });
    pasajero = pasajeroRes.body;
  });

  beforeEach(async () => {
    // Create un nuevo viaje para cada test
    const viajeRes = await request
      .post("/api/viajes/")
      .set("Authorization", `Bearer ${conductorToken}`)
      .send({
        origen: "Quito",
        destino: "Guayaquil",
        hora_salida: new Date(Date.now() + 3600 * 1000),
        asientos_disponibles: 3,
      });
    viaje = viajeRes.body;
  });

  afterEach(async () => {
    await pool.query("DELETE FROM reservas");
    await pool.query("DELETE FROM viajes");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM usuarios");
    await pool.end();
  });

  describe("POST /api/reservas", () => {
    it("should create a reservation successfully", async () => {
      const response = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id_reserva");
      expect(response.body.id_pasajero).toBe(pasajero.id_usuario);
      expect(response.body.estado).toBe("pendiente");
    });

    it("should return 400 if the driver tries to reserve in their own trip", async () => {
      const response = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({ id_viaje: viaje.id_viaje });
      expect(response.status).toBe(400);
    });

    it("should return 400 if there are no available seats", async () => {
      // Create a trip with 0 seats
      const noSeatsViajeRes = await request
        .post("/api/viajes/")
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({
          origen: "A",
          destino: "B",
          hora_salida: new Date(Date.now() + 3600 * 1000),
          asientos_disponibles: 0,
        });
      const noSeatsViaje = noSeatsViajeRes.body;

      const response = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: noSeatsViaje.id_viaje });
      expect(response.status).toBe(400);
    });

    it("should return 400 if the trip is not active", async () => {
      // Create and then update trip to be inactive
      await request
        .put(`/api/viajes/${viaje.id_viaje}`)
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({ estado: "completado" });

      const response = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });
      expect(response.status).toBe(400);
    });

    it("should return 400 for duplicate reservations", async () => {
      // Create one reservation
      await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });

      // Try to create another one
      const response = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });
      expect(response.status).toBe(400);
    });

    it("should return 404 for a non-existent trip", async () => {
      const nonExistentViajeId = 999999; // Use an integer that is unlikely to exist
      const response = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: nonExistentViajeId });
      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/reservas/viaje/:id", () => {
    it("should get all active reservations for a trip", async () => {
      // Create a reservation
      await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });

      const response = await request
        .get(`/api/reservas/viaje/${viaje.id_viaje}`)
        .set("Authorization", `Bearer ${conductorToken}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id_pasajero).toBe(pasajero.id_usuario);
    });

    it("should not return cancelled or rejected reservations", async () => {
      // Create a reservation
      const reservaRes = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });
      const reserva = reservaRes.body;

      // Conductor rejects it
      const updateRes = await request
        .put(`/api/reservas/${reserva.id_reserva}/estado`)
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({ estado: "rechazada" });
      expect(updateRes.body.estado).toBe("rechazada"); // Verify the state was updated

      const response = await request
        .get(`/api/reservas/viaje/${viaje.id_viaje}`)
        .set("Authorization", `Bearer ${conductorToken}`);
      expect(response.status).toBe(404); // Because no *active* reservations are found
    });
  });

  describe("PUT /api/reservas/:id_reserva/estado", () => {
    let reserva;
    beforeEach(async () => {
      const reservaRes = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });
      reserva = reservaRes.body;
    });

    it("should allow the conductor to confirm a reservation", async () => {
      const response = await request
        .put(`/api/reservas/${reserva.id_reserva}/estado`)
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({ estado: "confirmada" });
      expect(response.status).toBe(200);
      expect(response.body.estado).toBe("confirmada");
    });

    it("should allow the conductor to reject a reservation", async () => {
      const response = await request
        .put(`/api/reservas/${reserva.id_reserva}/estado`)
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({ estado: "rechazada" });
      expect(response.status).toBe(200);
      expect(response.body.estado).toBe("rechazada");
    });

    it("should return 403 if another user tries to update status", async () => {
      const response = await request
        .put(`/api/reservas/${reserva.id_reserva}/estado`)
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ estado: "confirmada" });
      expect(response.status).toBe(403);
    });

    it("should return 400 for an invalid status", async () => {
      const response = await request
        .put(`/api/reservas/${reserva.id_reserva}/estado`)
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({ estado: "invalid_status" });
      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/reservas/:id_reserva/cancelar", () => {
    let reserva;
    beforeEach(async () => {
      const reservaRes = await request
        .post("/api/reservas")
        .set("Authorization", `Bearer ${pasajeroToken}`)
        .send({ id_viaje: viaje.id_viaje });
      reserva = reservaRes.body;
    });

    it("should allow the passenger to cancel their reservation", async () => {
      const response = await request
        .put(`/api/reservas/${reserva.id_reserva}/cancelar`)
        .set("Authorization", `Bearer ${pasajeroToken}`);
      expect(response.status).toBe(200);
      expect(response.body.estado).toBe("cancelada");
    });

    it("should return 403 if another user tries to cancel the reservation", async () => {
      const response = await request
        .put(`/api/reservas/${reserva.id_reserva}/cancelar`)
        .set("Authorization", `Bearer ${conductorToken}`);
      expect(response.status).toBe(403);
    });

    it("should return 400 if trying to cancel a non-cancellable reservation", async () => {
      // Conductor rejects the reservation first
      await request
        .put(`/api/reservas/${reserva.id_reserva}/estado`)
        .set("Authorization", `Bearer ${conductorToken}`)
        .send({ estado: "rechazada" });

      // Passenger tries to cancel it
      const response = await request
        .put(`/api/reservas/${reserva.id_reserva}/cancelar`)
        .set("Authorization", `Bearer ${pasajeroToken}`);
      expect(response.status).toBe(400);
    });
  });
});
