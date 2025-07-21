
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { connect, disconnect, clearDatabase } from "./db.js";
import { Reserva } from "../models/reserva.model.js";
import { Viaje } from "../models/viaje.model.js";
import { Usuario } from "../models/usuario.model.js";

describe("Reserva Model", () => {
  let conductor;
  let pasajero;
  let viaje;

  beforeAll(async () => {
    await connect();

    const conductorData = {
      nombre: "Conductor de Prueba",
      email: "conductor.prueba@example.com",
      numero_telefono: "0987654321",
    };
    conductor = new Usuario(conductorData);
    await conductor.save();

    const pasajeroData = {
      nombre: "Pasajero de Prueba",
      email: "pasajero.prueba@example.com",
      numero_telefono: "1234567890",
    };
    pasajero = new Usuario(pasajeroData);
    await pasajero.save();

    const viajeData = {
      id_conductor: conductor._id,
      origen: "Origen de Prueba",
      destino: "Destino de Prueba",
      hora_salida: new Date(),
      asientos_disponibles: 2,
      descripcion: "Viaje para prueba de reservas.",
      estado: "activo",
      etiquetas_area: ["test"],
    };
    viaje = new Viaje(viajeData);
    await viaje.save();
  });

  afterEach(async () => {
    await Reserva.deleteMany({});
  });

  afterAll(async () => {
    await clearDatabase();
    await disconnect();
  });

  it("debería crear una nueva reserva con propiedades válidas", async () => {
    const reservaData = {
      id_viaje: viaje._id,
      id_pasajero: pasajero._id,
      estado: "pendiente",
    };
    const reserva = new Reserva(reservaData);
    await reserva.save();

    const savedReserva = await Reserva.findById(reserva._id);
    expect(savedReserva).toBeDefined();
    expect(savedReserva.id_viaje.toString()).toBe(reservaData.id_viaje.toString());
    expect(savedReserva.id_pasajero.toString()).toBe(reservaData.id_pasajero.toString());
    expect(savedReserva.estado).toBe(reservaData.estado);
    expect(savedReserva.createdAt).toBeDefined();
    expect(savedReserva.updatedAt).toBeDefined();
  });

  it("no debería guardar una reserva sin un id_viaje", async () => {
    const reservaData = {
      id_pasajero: pasajero._id,
      estado: "pendiente",
    };
    const reserva = new Reserva(reservaData);
    await expect(reserva.save()).rejects.toThrow();
  });

  it("no debería guardar una reserva sin un id_pasajero", async () => {
    const reservaData = {
      id_viaje: viaje._id,
      estado: "pendiente",
    };
    const reserva = new Reserva(reservaData);
    await expect(reserva.save()).rejects.toThrow();
  });

  it("no debería guardar una reserva con un estado inválido", async () => {
    const reservaData = {
      id_viaje: viaje._id,
      id_pasajero: pasajero._id,
      estado: "estado_invalido",
    };
    const reserva = new Reserva(reservaData);
    await expect(reserva.save()).rejects.toThrow();
  });

  it("debería tener el estado 'pendiente' por defecto si no se especifica", async () => {
      const reservaData = {
        id_viaje: viaje._id,
        id_pasajero: pasajero._id,
      };
      const reserva = new Reserva(reservaData);
      await reserva.save();
      expect(reserva.estado).toBe("pendiente");
  });
});
