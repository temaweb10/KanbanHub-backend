import jwt from "jsonwebtoken";
import ProjectModel from "../models/Project.js";
import UserModel from "../models/User.js";

export const createProject = async (req, res) => {
  /*       code: req.body.code, */
  try {
    const doc = new ProjectModel({
      nameProject: req.body.nameProject,

      participants: [{ user: req.userId, role: "admin" }],
    });

    const project = await doc.save();

    return res.json(project);
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "Не удалось создать проект" });
  }
};
export const getProject = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.idProject)
      .populate({
        path: "columns.kanbanCards",
        model: "KanbanCard",
      })
      .populate({
        path: "columns.kanbanCards.executor",
        model: "KanbanCard",
        select: "fullName _id",
      })
      .exec();
    /*  .populate("kanbanCards.kanbanCardId")
      .exec(); */
    if (project) {
      const participant = project?.participants?.find(
        (participant) => participant?.user?.toString() === req.userId
      );
      if (participant) {
        return res.json(project);
      } else {
        return res.status(401).json({ message: "У вас недостаточно прав " });
      }
    } else {
      return res.status(500).json({ message: "Проект не найден" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ошибка при поиске проекта" });
  }
};

export const getUsersInProject = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.idProject).populate({
      path: "participants.user",
      model: "Users",
      select: "fullName",
    }); /* .populate({
      path: "participants.user",
      model: "Users",
    }); */
    console.log(project.participants);

    if (project) {
      return res.json(project?.participants);
    } else {
      return res.status(404).json({ message: "Проект не найден" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Ошибка при поиске проекта" });
  }
};
export const getAllProject = async (req, res) => {
  try {
    await ProjectModel.find({ "participants.user": req.userId })
      .then((projects) => {
        return res.status(200).json(projects);
      })
      .catch((err) => {
        return res.status(500).json({ message: "Ошибка при поиске дашборда" });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ошибка при поиске дашборда" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    // Найти проект по projectId из req.params.projectId
    await ProjectModel.findOne({ _id: req.params.idProject })
      .then(async (project) => {
        const participant = project?.participants?.find(
          (participant) => participant?.user?.toString() === req.userId
        );
        console.log(participant);
        if (participant && participant?.role === "admin") {
          // Удалить коллекцию проекта
          await ProjectModel.findOneAndDelete({ _id: req.params.idProject })
            .then(() => {
              res.status(200).json({ message: "Проект успешно удалён" });
            })
            .catch((err) => {
              console.log(err);
              res.status(200).json({ message: "Ошибка при удалении проекта" });
            });
        } else {
          res
            .status(401)
            .json({ message: "У вас нет прав для удаление проекта" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(404).json({ message: "Проект не найден" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ошибка при удалении проекта" });
  }
};
export const deleteParticipantProject = async (req, res) => {
  try {
    // Найти проект по projectId из req.params.projectId
    await ProjectModel.findOne({ _id: req.params.idProject })
      .then(async (project) => {
        const participant = project?.participants?.find(
          (participant) => participant?.user?.toString() === req.userId
        );
        console.log(participant.role);
        if (participant && participant?.role == "admin") {
          await ProjectModel.findOneAndUpdate(
            { _id: req.params.idProject },
            {
              $pull: { participants: { user: req.body.userId } },
            }
          )
            .then(() => {
              res.status(200).json({ message: "Участник успешной удалён" });
            })
            .catch((err) => {
              console.log(err);
              res
                .status(200)
                .json({ message: "Ошибка при удалении участника" });
            });
        } else {
          res
            .status(401)
            .json({ message: "У вас нет прав для удаление участника" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(404).json({ message: "Проект не найден" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ошибка при удалении задачи" });
  }
};

export const generateInviteLinkProject = async (req, res) => {
  try {
    const project = await ProjectModel.findOne({ _id: req.params.idProject });
    if (project) {
      const participant = project?.participants?.find(
        (participant) => participant?.user?.toString() === req.userId
      );

      if (participant && participant?.role === "admin") {
        const token = jwt.sign(
          {
            _idInviter: req.userId,
            _idProject: req.params.idProject,
            role: req.body.role,
          },
          "kanbanhub_invite_link_jwt_secret",
          {
            expiresIn: "5d",
          }
        );

        res.status(200).json(token);
      } else {
        res.status(401).json({
          message: "У вас нет прав для создании пригласительной сыллки",
        });
      }
    } else {
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Ошибка при создании пригласительной сыллки");
  }
};

export const acceptInviteLinkProject = async (req, res) => {
  const token = req.body.token;
  console.log(token);
  if (token) {
    jwt.verify(
      token,
      "kanbanhub_invite_link_jwt_secret",
      async function (err, decoded) {
        if (err) {
          console.log(err);
          return res.status(403).json({
            message: "Ссылка устарела",
          });
        }

        const project = await ProjectModel.findById(decoded._idProject);
        if (project) {
          const participant = project?.participants?.find((participant) => {
            return participant?.user?.toString() === req.userId;
          });

          if (participant !== undefined) {
            return res
              .status(403)
              .json({ message: "Вы уже состоите в проекте" });
          }
          project.participants.push({
            user: req.userId,

            role: decoded.role,
          });

          const inviter = await UserModel.findById(decoded._idInviter).select(
            "fullName"
          );

          project.save(project);
          return res.status(200).json({
            idProject: project._id,
            _idInviter: decoded._idInviter,
            inviterFullName: inviter.fullName,
          });
        } else {
          return res.status(404).json({
            message: "Проект не найден",
          });
        }
      }
    );
  }
};

export const createColumnBoard = async (req, res) => {
  const project = await ProjectModel.findById(req.params.idProject);
  if (project) {
    const participant = project?.participants?.find(
      (participant) => participant?.user?.toString() === req.userId
    );

    if (participant && participant?.role !== "viewer") {
      /* ProjectModel.findOneAndUpdate(
        { _id: req.params.idProject },
        {
          $push: {
            columns: {
              name: req.body.name,
              columnId: `${req.body.name.replace(
                /\s/g,
                ""
              )}_${new Date().getTime()}`,
            },
          },
        }
      )
        .then(() => {
          res.status(200).json({ message: "Колонка успешно добавлена" });
        })
        .catch((error) => {
          console.log(error);
          res.status(200).json({ message: "Ошибка при создании колонки" });
        }); */
      project.columns.push({
        name: req.body.name,
        columnId: `${req.body.name.replace(/\s/g, "")}_${new Date().getTime()}`,
        kanbanCards: [],
      });

      await project.save().catch((error) => {
        console.log(error);
        res.status(200).json({ message: "Ошибка при создании колонки" });
      });

      const projectNew = await ProjectModel.findById(req.params.idProject)
        .populate({
          path: "columns.kanbanCards",
          model: "KanbanCard",
        })
        .exec();
      return res.status(200).json(projectNew.columns);
    } else {
      res.status(401).json({ message: "У вас недостаточно прав " });
    }
  } else {
    res.status(500).json({ message: "Проект не найден" });
  }
};

export const columnChangeNameBoard = async (req, res) => {
  const project = await ProjectModel.findById(req.params.idProject);
  if (project) {
    const participant = project?.participants?.find(
      (participant) => participant?.user?.toString() === req.userId
    );

    if (participant && participant?.role !== "viewer") {
      /*  ProjectModel.findOneAndUpdate(
        { "columns.columnId": req.body.columnId },
        { $set: { "columns.$.name": req.body.name } },
        { new: true }
      )
        .then((doc) => {
          if (doc) {
            res.status(200).json({ message: "Колонка успешно добавлена" });
          } else {
            res.status(200).json({ message: "Ошибка при изменении  колонки" });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(200).json({ message: "Ошибка при изменении  колонки" });
        }); */
      let column = project.columns.find(
        (col) => col.columnId === req.body.columnId
      );
      if (column) {
        column.name = req.body.name;
        await project.save();
        return res.json(project);
      } else {
        return res.status(404).json({ message: "Колонна не найдена" });
      }
    } else {
      res.status(401).json({ message: "У вас недостаточно прав " });
    }
  } else {
    res.status(500).json({ message: "Проект не найден" });
  }
};

export const deleteColumnBoard = async (req, res) => {
  const project = await ProjectModel.findById(req.params.idProject);
  if (project) {
    const participant = project?.participants?.find(
      (participant) => participant?.user?.toString() === req.userId
    );

    if (participant && participant?.role !== "viewer") {
      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      project.columns = project.columns.filter(
        (el) => el.columnId !== req.params.idColumn
      );

      await project.save();

      res.status(200).json({ message: "Колонка успешно удалена" });
    } else {
      res
        .status(401)
        .json({ message: "У вас недостаточно прав для удаление колонки" });
    }
  } else {
    res.status(500).json({ message: "Проект не найден" });
  }
};
