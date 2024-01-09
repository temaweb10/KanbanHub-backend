import jwt from "jsonwebtoken";
import ProjectModel from "../models/Project.js";

export const createProject = async (req, res) => {
  try {
    const doc = new ProjectModel({
      nameProject: req.body.nameProject,
      code: req.body.code,
      participants: [{ user: req.userId, role: "admin" }],
    });

    const project = await doc.save();

    res.json(project);
  } catch (error) {
    console.log(error);
    res.json({ message: "Не удалось создать проект" });
  }
};
export const getProject = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.idProject)
      .populate("kanbanCards.kanbanCardId")
      .exec();
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

  await ProjectModel.findOne({ _id: req.params.idProject }).then(
    async (project) => {
      if (project) {
        console.log(project?.participants);
        const participant = project?.participants?.find((participant) => {
          return participant?.user?.toString() === req.userId;
        });

        if (participant !== undefined) {
          return res.status(403).json({ message: "Вы уже состоите в проекте" });
        } else {
          if (token) {
            jwt.verify(
              token,
              "kanbanhub_invite_link_jwt_secret",
              async function (err, decoded) {
                if (err) {
                  return res.status(403).json({
                    message: "Ссылка устарела",
                  });
                }
                ProjectModel.findByIdAndUpdate(
                  decoded._idProject,
                  {
                    $push: {
                      participants: {
                        user: req.userId,

                        role: decoded.role,
                      },
                    },
                  },
                  { new: true }
                )
                  .then((doc) => {
                    console.log(doc);
                    return res
                      .status(200)
                      .json({ message: "Успешное вступление в проект" });
                  })
                  .catch((error) => {
                    console.log(error);
                    return res
                      .status(200)
                      .json({ message: "Ошибка при вступлении проекта" });
                  });
              }
            );
          } else {
            return res.status(403).json({
              message: "Нет доступа",
            });
          }
        }
      } else {
        return res.status(404).json({
          message: "Проект не найден",
        });
      }
    }
  );
};

export const createColumnBoard = async (req, res) => {
  const project = await ProjectModel.findById(req.params.idProject);
  if (project) {
    const participant = project?.participants?.find(
      (participant) => participant?.user?.toString() === req.userId
    );

    if (participant && participant?.role !== "viewer") {
      ProjectModel.findOneAndUpdate(
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
        });
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
      ProjectModel.findOneAndUpdate(
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
        });
    } else {
      res.status(401).json({ message: "У вас недостаточно прав " });
    }
  } else {
    res.status(500).json({ message: "Проект не найден" });
  }
};
//!ПЕРЕДЕЛАТЬ
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
        (column) => column.columnId !== req.body.columnId
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
