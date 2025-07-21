
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { connect, disconnect, clearDatabase } from "./db.js";
import { Viaje } from "../models/viaje.model.js";
import { Usuario } from "../models/usuario.model.js";

describe("Viaje Model", () => {
  let conductor;

  beforeAll(async () => {
    await connect();
    const conductorData = {
      nombre: "Mario Neta",
      email: "marioneta@puce.edu.ec",
      numero_telefono: "1234567890",
    };
    conductor = new Usuario(conductorData);
    await conductor.save();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("debería crear un nuevo viaje con propiedades válidas", async () => {
    const viajeData = {
      id_conductor: conductor._id.toString(),
      origen: "Origen Test",
      destino: "Destino Test",
      hora_salida: new Date(),
      asientos_disponibles: 3,
      descripcion: "Descripción del viaje de prueba.",
      estado: "activo",
      etiquetas_area: ["etiqueta1", "etiqueta2"],
    };

    const viaje = new Viaje(viajeData);
    await viaje.save();

    const savedViaje = await Viaje.findById(viaje._id);
    expect(savedViaje).toBeDefined();
    expect(savedViaje.id_conductor.toString()).toBe(viajeData.id_conductor);
    expect(savedViaje.origen).toBe(viajeData.origen);
    expect(savedViaje.destino).toBe(viajeData.destino);
    expect(savedViaje.hora_salida).toBeInstanceOf(Date);
    expect(savedViaje.asientos_disponibles).toBe(viajeData.asientos_disponibles);
    expect(savedViaje.descripcion).toBe(viajeData.descripcion);
    expect(savedViaje.estado).toBe(viajeData.estado);
    expect(savedViaje.etiquetas_area).toEqual(expect.arrayContaining(viajeData.etiquetas_area));
    expect(savedViaje.createdAt).toBeDefined();
    expect(savedViaje.updatedAt).toBeDefined();
  });

  it("no debería guardar un viaje sin el id de conductor", async () => {
    const viajeData = {
        origen: "Origen Test",
        destino: "Destino Test",
        hora_salida: new Date(),
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        estado: "activo",
        etiquetas_area: ["etiqueta1"],
     };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

  it("no debería guardar un viaje sin un origen", async () => {
    const viajeData = {
        id_conductor: conductor._id.toString(),
        destino: "Destino Test",
        hora_salida: new Date(),
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        estado: "activo",
        etiquetas_area: ["etiqueta1"],
    };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

  it("no debería guardar un viaje sin un destino", async () => {
    const viajeData = {
        id_conductor: conductor._id.toString(),
        origen: "Origen Test",
        hora_salida: new Date(),
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        estado: "activo",
        etiquetas_area: ["etiqueta1"],
    };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

  it("no debería guardar un viaje sin una hora_salida", async () => {
    const viajeData = {
        id_conductor: conductor._id.toString(),
        origen: "Origen Test",
        destino: "Destino Test",
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        estado: "activo",
        etiquetas_area: ["etiqueta1"],
    };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

    it("no debería guardar un viaje sin un estado", async () => {
    const viajeData = {
        id_conductor: conductor._id.toString(),
        origen: "Origen Test",
        destino: "Destino Test",
        hora_salida: new Date(),
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        etiquetas_area: ["etiqueta1"],
    };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

  it("no debería guardar un viaje si origen y destino son iguales", async () => {
    const viajeData = {
        id_conductor: conductor._id.toString(),
        origen: "Mismo Lugar",
        destino: "Mismo Lugar",
        hora_salida: new Date(),
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        estado: "activo",
        etiquetas_area: ["etiqueta1"],
    };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

  it("no debería guardar un viaje con un estado inválido", async () => {
    const viajeData = {
        id_conductor: conductor._id.toString(),
        origen: "Origen Test",
        destino: "Destino Test",
        hora_salida: new Date(),
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        estado: "estado_invalido",
        etiquetas_area: ["etiqueta1"],
    };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

  it("no debería guardar un viaje con etiquetas de área vacías", async () => {
    const viajeData = {
        id_conductor: conductor._id.toString(),
        origen: "Origen Test",
        destino: "Destino Test",
        hora_salida: new Date(),
        asientos_disponibles: 3,
        descripcion: "Descripción del viaje de prueba.",
        estado: "activo",
        etiquetas_area: [],
    };
    const viaje = new Viaje(viajeData);
    await expect(viaje.save()).rejects.toThrow();
  });

});
