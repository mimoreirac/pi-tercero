import express from "express";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import viajeRoutes from "./routes/viajeRoutes.js";
import reservasRoutes from "./routes/reservasRoutes.js";
import incidentesRoutes from "./routes/incidentesRoutes.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/viajes", viajeRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/incidentes", incidentesRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto: ${port}`);
});

export default app;
