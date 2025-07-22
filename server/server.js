import express from "express";
import pool from "./db.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());

pool
  .connect()
  .then(() => console.log("Conectado a la base de datos de PostgreSQL"))
  .catch((err) => console.error("Error de conexión a la base de datos: ", err));
