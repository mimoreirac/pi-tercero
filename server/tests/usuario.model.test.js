import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { connect, disconnect, clearDatabase } from "./db.js";
import { Usuario } from "../models/usuario.model.js";

describe("Usuario Model", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("debería crear un usuario con las propiedades válidas", async () => {
    const userData = {
      nombre: "Mario Neta",
      email: "marioneta@puce.edu.ec",
      numero_telefono: "1234567890",
    };
    const usuario = new Usuario(userData);
    await usuario.save();

    const savedUser = await Usuario.findById(usuario._id);
    expect(savedUser).toBeDefined();
    expect(savedUser.nombre).toBe(userData.nombre);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.numero_telefono).toBe(userData.numero_telefono);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it("no debería crear un usuario sin un email", async () => {
    const userData = { nombre: "Mario Neta", numero_telefono: "1234567890" };
    const usuario = new Usuario(userData);
    await expect(usuario.save()).rejects.toThrow();
  });

  it("no debería crear un usuario sin un nombre", async () => {
    const userData = {
      email: "marioneta@puce.edu.ec",
      numero_telefono: "1234567890",
    };
    const usuario = new Usuario(userData);
    await expect(usuario.save()).rejects.toThrow();
  });

  it("no debería crear un usuario sin un número de teléfono", async () => {
    const userData = { nombre: "Mario Neta", email: "marioneta@puce.edu.ec" };
    const usuario = new Usuario(userData);
    await expect(usuario.save()).rejects.toThrow();
  });

  it("no debería crear un usuario con un email duplicado", async () => {
    const userData1 = {
      nombre: "Mario Neta",
      email: "marioneta@puce.edu.ec",
      numero_telefono: "1234567890",
    };
    const userData2 = {
      nombre: "Armando Hoyos",
      email: "marioneta@puce.edu.ec",
      numero_telefono: "0987654321",
    };
    const usuario1 = new Usuario(userData1);
    await usuario1.save();

    const usuario2 = new Usuario(userData2);
    await expect(usuario2.save()).rejects.toThrow();
  });

  it("no debería crear un usuario con un número de teléfono duplicado", async () => {
    const userData1 = {
      nombre: "Mario Neta",
      email: "marioneta1@puce.edu.ec",
      numero_telefono: "1234567890",
    };
    const userData2 = {
      nombre: "Armando Hoyos",
      email: "ahoyos@puce.edu.ec",
      numero_telefono: "1234567890",
    };
    const usuario1 = new Usuario(userData1);
    await usuario1.save();

    const usuario2 = new Usuario(userData2);
    await expect(usuario2.save()).rejects.toThrow();
  });

  it("debería validar que el número de teléfono tenga 10 dígitos", async () => {
    const userData = {
      nombre: "Mario Neta",
      email: "marioneta@puce.edu.ec",
      numero_telefono: "12345",
    };
    const usuario = new Usuario(userData);
    await expect(usuario.save()).rejects.toThrow();
  });
});
