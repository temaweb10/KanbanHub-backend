import express from "express";
import {
  acceptInviteLinkProject,
  columnChangeNameBoard,
  createColumnBoard,
  createProject,
  deleteColumnBoard,
  deleteParticipantProject,
  deleteProject,
  generateInviteLinkProject,
  getAllProject,
  getProject,
} from "../controllers/ProjectController.js";
import checkAuth from "../utils/checkAuth.js";
import handleValidation from "../utils/handleValidationError.js";
import { projectValidation } from "../validations.js";
const router = express.Router();

router.post(
  "/project",
  checkAuth,
  projectValidation,
  handleValidation,
  createProject
);
router.get(
  "/project/:idProject",
  checkAuth,

  getProject
);
router.get(
  "/projects",
  checkAuth,

  getAllProject
);
router.delete("/project/:idProject", checkAuth, deleteProject);
router.delete(
  "/project/:idProject/deleteParticipant",
  checkAuth,
  deleteParticipantProject
);
router.delete(
  "/project/:idProject/deleteColumnBoard/:idColumn",
  checkAuth,
  deleteColumnBoard
);
router.get(
  "/project/:idProject/generateInviteLink",
  checkAuth,
  generateInviteLinkProject
);
router.get(
  "/project/:idProject/acceptInviteLink",
  checkAuth,
  acceptInviteLinkProject
);

router.post("/project/:idProject/columnCreate", checkAuth, createColumnBoard);
router.post(
  "/project/:idProject/columnChangeName",
  checkAuth,
  columnChangeNameBoard
);

export default router;
