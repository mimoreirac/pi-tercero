import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

describe("CRUD de reservas", () => {
  let conductorId;
  let pasajeroId;
  let viajeId;

  beforeAll(async () => {
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

    const response = await supertest(app).post("/reservas").send(nuevaReserva);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id_reserva");
    expect(response.body.id_viaje).toBe(nuevaReserva.id_viaje);
    expect(response.body.id_pasajero).toBe(nuevaReserva.id_pasajero);
  });

  it("debería obtener una reserva por su id", async () => {
    const nuevaReserva = {
      id_viaje: viajeId,
      id_pasajero: pasajeroId,
      estado: "pendiente",
    };

    const reservaCreada = await supertest(app).post("/reservas").send(nuevaReserva);
    const reservaId = reservaCreada.body.id_reserva;

    const response = await supertest(app).get(`/reservas/${reservaId}`);

    expect(response.status).toBe(200);
    expect(response.body.id_reserva).toBe(reservaId);
  });

  it("debería actualizar una reserva", async () => {
    const nuevaReserva = {
      id_viaje: viajeId,
      id_pasajero: pasajeroId,
      estado: "pendiente",
    };

    const reservaCreada = await supertest(app).post("/reservas").send(nuevaReserva);
    const reservaId = reservaCreada.body.id_reserva;

    const datosActualizados = {
      estado: "confirmada",
    };

    const response = await supertest(app).put(`/reservas/${reservaId}`).send(datosActualizados);

    expect(response.status).toBe(200);
    expect(response.body.estado).toBe(datosActualizados.estado);
  });

  it("debería eliminar una reserva", async () => {
    const nuevaReserva = {
      id_viaje: viajeId,
      id_pasajero: pasajeroId,
      estado: "pendiente",
    };

    const reservaCreada = await supertest(app).post("/reservas").send(nuevaReserva);
    const reservaId = reservaCreada.body.id_reserva;

    const response = await supertest(app).delete(`/reservas/${reservaId}`);

    expect(response.status).toBe(204);

    const dbReserva = await pool.query("SELECT * FROM reservas WHERE id_reserva = $1", [reservaId]);
    expect(dbReserva.rows.length).toBe(0);
  });
});
