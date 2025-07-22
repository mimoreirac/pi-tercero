import { Router } from "express";
import { createUser, getUserById, updateUser, deleteUser } from "../controllers/usuarioController.js";

const router = Router();

router.post("/usuarios", createUser);
router.get("/usuarios/:id", getUserById);
router.put("/usuarios/:id", updateUser);
router.delete("/usuarios/:id", deleteUser);

export default router;
