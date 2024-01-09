import express from "express";
import { createProject } from "../controllers/ProjectController.js";
import checkAuth from "../utils/checkAuth.js";
const router = express.Router();

router.post("/project", checkAuth, createProject);

export default router;
