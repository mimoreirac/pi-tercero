
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { connect, disconnect, clearDatabase } from "./db.js";
import { Incidente } from "../models/incidente.model.js";
import { Viaje } from "../models/viaje.model.js";
import { Usuario } from "../models/usuario.model.js";

describe("Modelo de Incidente", () => {
  let conductor;
  let reportador;
  let viaje;

  beforeAll(async () => {
    await connect();

    conductor = await new Usuario({
      nombre: "Conductor de Prueba",
      email: "conductor.incidente@example.com",
      numero_telefono: "1112223331",
    }).save();

    reportador = await new Usuario({
      nombre: "Reportador de Prueba",
      email: "reportador.incidente@example.com",
      numero_telefono: "4445556661",
    }).save();

    viaje = await new Viaje({
      id_conductor: conductor._id,
      origen: "Origen para Incidente",
      destino: "Destino para Incidente",
      hora_salida: new Date(),
      asientos_disponibles: 1,
      estado: "activo",
      etiquetas_area: ["incidente-test"],
    }).save();
  });

  afterEach(async () => {
    await Incidente.deleteMany({});
  });

  afterAll(async () => {
    await clearDatabase();
    await disconnect();
  });

  it("debería crear un nuevo incidente con propiedades válidas", async () => {
    const incidenteData = {
      id_viaje: viaje._id,
      id_reportador: reportador._id,
      descripcion: "El conductor iba a exceso de velocidad.",
    };
    const incidente = new Incidente(incidenteData);
    await incidente.save();

    const savedIncidente = await Incidente.findById(incidente._id);
    expect(savedIncidente).toBeDefined();
    expect(savedIncidente.id_viaje.toString()).toBe(incidenteData.id_viaje.toString());
    expect(savedIncidente.id_reportador.toString()).toBe(incidenteData.id_reportador.toString());
    expect(savedIncidente.descripcion).toBe(incidenteData.descripcion);
    expect(savedIncidente.createdAt).toBeDefined();
    expect(savedIncidente.updatedAt).toBeDefined();
  });

  it("no debería guardar un incidente sin un id_viaje", async () => {
    const incidenteData = {
      id_reportador: reportador._id,
      descripcion: "Falta el ID del viaje.",
    };
    const incidente = new Incidente(incidenteData);
    await expect(incidente.save()).rejects.toThrow();
  });

  it("no debería guardar un incidente sin un id_reportador", async () => {
    const incidenteData = {
      id_viaje: viaje._id,
      descripcion: "Falta el ID del reportador.",
    };
    const incidente = new Incidente(incidenteData);
    await expect(incidente.save()).rejects.toThrow();
  });

  it("no debería guardar un incidente sin una descripción", async () => {
    const incidenteData = {
      id_viaje: viaje._id,
      id_reportador: reportador._id,
    };
    const incidente = new Incidente(incidenteData);
    await expect(incidente.save()).rejects.toThrow();
  });
});
