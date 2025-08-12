import express from "express";
import pool from "./db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import viajeRoutes from "./routes/viajeRoutes.js";
import incidentesRoutes from "./routes/incidentesRoutes.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());

app.use(usuarioRoutes);
app.use(viajeRoutes);
app.use(incidentesRoutes);

export default app;
