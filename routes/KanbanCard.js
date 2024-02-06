import express from "express";
import {
  createKanbanCard,
  deleteKanbanCard,
  editKanbanCard,
  getKanbanCard,
  updateColumns,
} from "../controllers/KanbanCardController.js";
import checkAuth from "../utils/checkAuth.js";
import handleValidation from "../utils/handleValidationError.js";
import { kanbanCardCreateValidation } from "../validations.js";
const router = express.Router();

router.post(
  "/project/:idProject/kanbanCardCreate",
  checkAuth,
  createKanbanCard
);
router.get(
  "/project/:idProject/kanbanCard/:idKanbanCard",
  checkAuth,
  getKanbanCard
);
router.post("/project/:idProject/kanbanCardEdit", checkAuth, editKanbanCard);
router.post("/project/:idProject/updateColumns", checkAuth, updateColumns);
router.delete("/project/:idProject/kanbanCard", checkAuth, deleteKanbanCard);

export default router;
