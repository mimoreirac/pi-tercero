import { Router } from "express";
import {
  createViaje,
  getViajeById,
  updateViaje,
  deleteViaje,
  getActiveViajes,
  getMyViajes,
} from "../controllers/viajesController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, createViaje);
router.get("/", protect, getActiveViajes);
router.get("/me", protect, getMyViajes);
router.get("/:id", protect, getViajeById);
router.put("/:id", protect, updateViaje);
router.delete("/:id", protect, deleteViaje);

export default router;
