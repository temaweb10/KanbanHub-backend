import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";

import { login, register } from "./controllers/UserController.js";
import { loginValidation, registerValidation } from "./validations.js";

import KanbanCardRoute from "./routes/KanbanCard.js";
import ProjectRoute from "./routes/Project.js";
import UserRoute from "./routes/User.js";

const app = express();

mongoose
  .connect(
    "mongodb+srv://pashkovdev:7cT5oDDF0oDtpvxA@cluster0.xkxqnbu.mongodb.net/kanbanhub?retryWrites=true&w=majority"
  )
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

app.listen(3333, () => {
  console.log("server working on 3333 PORT");
});
