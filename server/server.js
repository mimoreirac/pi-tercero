import express from "express";
import pool from "./db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());

app.use(usuarioRoutes);

export default app;
