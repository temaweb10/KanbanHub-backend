import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import multer from "multer";
import { Server } from "socket.io";

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

/* app.use(cors()); */
app.use(cors());
app.use(express.json());

app.use(UserRoute);
app.use(KanbanCardRoute);
app.use(ProjectRoute);

let server = app.listen(3333, () => {
  console.log("server working on 3333 PORT");
});
/* 
const server = http.createServer(app); */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
io.on("connection", (socket) => {
  socket.on("changeProject", async (idProject) => {
    ProjectModel.findById(idProject)
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
        io.emit("changeProjectState", resProject);
      });
  });
  /*   socket.on("watchProject", (idProject) => {
    console.log(`idProject: ${idProject}`);
    ProjectModel.watch({
      fullDocument: "updateLookup",
      filter: { _id: idProject },
    }).on("change", async (change) => {
      console.log("CHAANGEE PROJECT");
      ProjectModel.findById(idProject)
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
          io.emit("projectUpdated", resProject);
        });
    });
  }); */
});
/* .populate({
        path: "columns.kanbanCards",
        model: "KanbanCard",
      })
      .populate({
        path: "columns.kanbanCards.executor",
        model: "KanbanCard",
        select: "fullName _id",
      }) */
