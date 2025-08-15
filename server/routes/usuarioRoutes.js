import { Router } from "express";
import {
  getOrCreateUser,
  getMe,
  updateUser,
  deleteUser,
  getById,
} from "../controllers/usuarioController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/sync", protect, getOrCreateUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateUser);
router.delete("/me", protect, deleteUser);
router.get("/:id", protect, getById); // Idealmente para seguridad, solo deberia retornar el id y el nombre tambien numero?

export default router;
