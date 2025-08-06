import { Router } from "express";
import {
  getOrCreateUser,
  getMe,
  updateUser,
  deleteUser,
} from "../controllers/usuarioController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/sync", protect, getOrCreateUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateUser);
router.delete("/me", protect, deleteUser);

export default router;
