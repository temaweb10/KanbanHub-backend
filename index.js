import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as fs from "fs";
import http from "http";
import mongoose from "mongoose";
import multer from "multer";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const idProject = req.params.idProject;
    const uploadPath = `uploads/projects/project_${idProject}/avatar`;

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.post(
  "/project/:idProject/upload-avatar",
  upload.single("avatar"),
  (req, res) => {
    console.log(req.filename);
    res.status(200).json({ message: "Успешная загрузка аватара" });
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
