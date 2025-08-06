import { Router } from "express";
import {
  getOrCreateUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/usuarioController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/sync", protect, getOrCreateUser);
router.get("/:id", getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;
