import kanbanCardModel from "../models/kanbanCard.js";
import ProjectModel from "../models/Project.js";
export const createKanbanCard = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.idProject);
    if (project) {
      const participant = project?.participants?.find(
        (participant) => participant?.user?.toString() === req.userId
      );
      if (participant && participant?.role !== "viewer") {
        const doc = new kanbanCardModel({
          nameCard: req.body.nameCard,
          description: req.body.description,
          columnId: req.body.columnId,
          projectId: req.body.projectId,
          creator: req.userId,
          codeNum: `${project.code}-${project.kanbanCards.length}`,
        });
        console.log(doc);
        const kanbanCard = await doc.save();
        console.log(kanbanCard);
        await ProjectModel.findByIdAndUpdate(
          req.params.idProject,
          {
            $push: {
              kanbanCards: {
                kanbanCardId: kanbanCard._id,
              },
            },
          },
          { new: true }
        ).then((doc) => {
          console.log(doc);
        });

        return res.json(kanbanCard);
      } else {
        return res.status(401).json({ message: "У вас недостаточно прав " });
      }
    } else {
      return res.status(500).json({ message: "Проект не найден" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось создать задачу",
    });
  }
};
export const editKanbanCard = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.idProject);
    if (project) {
      const participant = project?.participants?.find(
        (participant) => participant?.user?.toString() === req.userId
      );
      if (participant && participant?.role !== "viewer") {
        const kanbanCard = await kanbanCardModel
          .findOneAndUpdate(
            { codeNum: req.params.codeNum },
            {
              nameCard: req.body.nameCard,
              description: req.body.description,
              columnId: req.body.columnId,
              executor: req.body.executor,
            },
            { new: true }
          )
          .then((doc) => {
            return res.status(200).json(doc);
          });

        return res.json(kanbanCard);
      } else {
        return res.status(401).json({ message: "У вас недостаточно прав " });
      }
    } else {
      return res.status(500).json({ message: "Проект не найден" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось создать задачу",
    });
  }
}; //!доделать
export const deleteKanbanCard = async (req, res) => {
  try {
    // Найти проект по projectId из req.params.projectId
    await ProjectModel.findOne({ _id: req.params.idProject })
      .then(async (project) => {
        const participant = project?.participants?.find(
          (participant) => participant?.user?.toString() === req.userId
        );
        console.log(participant);
        if (participant && participant?.role !== "viewer") {
          await ProjectModel.findOneAndUpdate(
            { _id: req.params.idProject },
            {
              $pull: { kanbanCards: { kanbanCardId: req.params.idKanbanCard } },
            }
          )
            .then(() => {
              res.status(200).json({ message: "Задание успешно удалёно" });
            })
            .catch((err) => {
              console.log(err);
              res.status(200).json({ message: "Ошибка при удалении задачи" });
            });
        } else {
          res
            .status(401)
            .json({ message: "У вас нет прав для удаление задачи" });
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
}; //!доделать
