import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config("../.env");

const mongoUri = process.env.MONGODB_URI;
const port = process.env.PORT;
const app = express();

app.use(express.json());

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Conectado a MongoDB");

    app.listen(port, () =>
      console.log(`Servidor escuchando en el puerto ${port}`),
    );
  })
  .catch((err) => {
    console.error(
      "Error en la conexion con la base de datos. El servidor no se ha iniciado.",
      err,
    );
    process.exit(1);
  });
