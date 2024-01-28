import express from "express";
import {
  createKanbanCard,
  deleteKanbanCard,
  editKanbanCard,
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
router.post("/project/:idProject/kanbanCardEdit", checkAuth, editKanbanCard);
router.post("/project/:idProject/updateColumns", checkAuth, updateColumns);
router.delete("/project/:idProject/kanbanCard", checkAuth, deleteKanbanCard);

export default router;
