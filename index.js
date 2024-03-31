import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as fs from "fs";
import http from "http";
import mongoose from "mongoose";
import multer from "multer";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {findAndDeleteFile} from "./utils/findAndDeleteFile.js";
import ProjectModel from "./models/Project.js";
import KanbanCardRoute from "./routes/KanbanCard.js";
import ProjectRoute from "./routes/Project.js";
import UserRoute from "./routes/User.js";
const app = express();

// client-side

dotenv.config();
mongoose
  .connect(process.env.mongoConnectUrl)
  .then(() => {
    console.log("MONGODB WORKING");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());

app.use(UserRoute);
app.use(KanbanCardRoute);
app.use(ProjectRoute);
app.use("/uploads", express.static("uploads"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const format = file.originalname.slice(file.originalname.lastIndexOf('.') + 1);
    const idProject = req.params.idProject;
    const uploadPath = `uploads/projects/`;

    findAndDeleteFile('./uploads/projects/',`project-avatar_${idProject}`)

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const avatarUrl = `project-avatar_${idProject}.${format.toLowerCase()}`



    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const format = file.originalname.slice(file.originalname.lastIndexOf('.') + 1);
    const idProject = req.params.idProject;
    const avatarUrl = `project-avatar_${idProject}.${format.toLowerCase()}`
    cb(null, avatarUrl);
  },
});

const upload = multer({ storage: storage });

app.post(
  "/project/:idProject/upload-avatar",
  upload.single("avatar"),
  async (req, res) => {

    const format = req.file.originalname.slice(req.file.originalname.lastIndexOf('.') + 1);
    const idProject = req.params.idProject;
    const avatarUrl = `uploads/projects/project-avatar_${idProject}.${format.toLowerCase()}`
    await ProjectModel.findByIdAndUpdate(idProject, {avatarUrl: avatarUrl, avatarColor: ''})
    res.status(200).json({avatarUrl:avatarUrl});
  }
);

let server = app.listen(3333, () => {
  console.log("server working on 3333 PORT");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("changeProject", async (dataStringify) => {
    console.log(`dataStringify ${dataStringify}`);
    const dataParse = JSON.parse(dataStringify);

    ProjectModel.findById(dataParse.idProject)
      .populate({
        path: "columns.kanbanCards",
        model: "KanbanCard",
      })
      .populate({
        path: "columns.kanbanCards.executor",
        model: "KanbanCard",
        select: "fullName _id",
      })
      .then((resProject) => {
        console.log("emit:changeProjectState");
        io.emit(
          "changeProjectState",
          JSON.stringify({
            projectUpdated: resProject,
            idUserChangedProject: dataParse.idUserChangedProject,
          })
        );
      });
  });
});
