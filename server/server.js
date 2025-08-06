import express from "express";
import pool from "./db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import viajeRoutes from "./routes/viajeRoutes.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/viajes", viajeRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto: ${port}`)
})

export default app;
