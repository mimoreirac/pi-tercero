
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { connect, disconnect, clearDatabase } from "./db.js";
import { RegistroAuditoria } from "../models/registro_auditoria.model.js";
import { Viaje } from "../models/viaje.model.js";
import { Usuario } from "../models/usuario.model.js";

describe("Modelo de Registro de Auditoría", () => {
  let usuario;
  let viaje;

  beforeAll(async () => {
    await connect();

    usuario = await new Usuario({
      nombre: "Usuario de Auditoría",
      email: "auditoria@example.com",
      numero_telefono: "5555555555",
    }).save();

    const conductor = await new Usuario({
        nombre: "Conductor de Auditoría",
        email: "conductor.auditoria@example.com",
        numero_telefono: "9998887776"
    }).save();

    viaje = await new Viaje({
      id_conductor: conductor._id,
      origen: "Origen para Auditoría",
      destino: "Destino para Auditoría",
      hora_salida: new Date(),
      asientos_disponibles: 1,
      estado: "activo",
      etiquetas_area: ["auditoria-test"],
    }).save();
  });

  afterEach(async () => {
    await RegistroAuditoria.deleteMany({});
  });

  afterAll(async () => {
    await clearDatabase();
    await disconnect();
  });

  it("debería crear un nuevo registro de auditoría con propiedades válidas", async () => {
    const registroData = {
      id_usuario: usuario._id,
      accion: "viaje_creado",
      tipo_recurso: "viaje",
      id_recurso: viaje._id,
    };
    const registro = new RegistroAuditoria(registroData);
    await registro.save();

    const savedRegistro = await RegistroAuditoria.findById(registro._id);
    expect(savedRegistro).toBeDefined();
    expect(savedRegistro.id_usuario.toString()).toBe(registroData.id_usuario.toString());
    expect(savedRegistro.accion).toBe(registroData.accion);
    expect(savedRegistro.tipo_recurso).toBe(registroData.tipo_recurso);
    expect(savedRegistro.id_recurso.toString()).toBe(registroData.id_recurso.toString());
    expect(savedRegistro.createdAt).toBeDefined();
    expect(savedRegistro.updatedAt).toBeDefined();
  });

  it("no debería guardar un registro sin un id_usuario", async () => {
    const registroData = {
      accion: "viaje_creado",
      tipo_recurso: "viaje",
      id_recurso: viaje._id,
    };
    const registro = new RegistroAuditoria(registroData);
    await expect(registro.save()).rejects.toThrow();
  });

  it("no debería guardar un registro sin una acción", async () => {
    const registroData = {
      id_usuario: usuario._id,
      tipo_recurso: "viaje",
      id_recurso: viaje._id,
    };
    const registro = new RegistroAuditoria(registroData);
    await expect(registro.save()).rejects.toThrow();
  });

  it("no debería guardar un registro sin un tipo_recurso", async () => {
    const registroData = {
      id_usuario: usuario._id,
      accion: "viaje_creado",
      id_recurso: viaje._id,
    };
    const registro = new RegistroAuditoria(registroData);
    await expect(registro.save()).rejects.toThrow();
  });

  it("no debería guardar un registro sin un id_recurso", async () => {
    const registroData = {
      id_usuario: usuario._id,
      accion: "viaje_creado",
      tipo_recurso: "viaje",
    };
    const registro = new RegistroAuditoria(registroData);
    await expect(registro.save()).rejects.toThrow();
  });
});
