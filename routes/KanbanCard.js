import express from "express";
import {
  createKanbanCard,
  deleteKanbanCard,
  editKanbanCard,
} from "../controllers/KanbanCardController.js";
import checkAuth from "../utils/checkAuth.js";
import handleValidation from "../utils/handleValidationError.js";
import { kanbanCardCreateValidation } from "../validations.js";
const router = express.Router();

router.post("/project/:idProject/kanbanCard/", checkAuth, createKanbanCard);
router.post(
  "/project/:idProject/kanbanCard/:codeNum/edit",
  checkAuth,
  editKanbanCard
);
router.delete(
  "/project/:idProject/kanbanCard/:idKanbanCard",
  checkAuth,
  deleteKanbanCard
);

export default router;
