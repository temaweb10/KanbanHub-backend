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
          columnId: req.params.idColumn,
          projectId: req.body.projectId,
          creator: req.userId,
          codeNum: `${project.code}-${project.kanbanCardsLength}`,
        });
        console.log(req.params.idColumn);
        const kanbanCard = await doc.save();
        console.log(kanbanCard);

        let column = project.columns.find(
          (col) => col.columnId === req.params.idColumn
        );
        if (column) {
          column.kanbanCards.push(kanbanCard._id);
          await project.save();
          return res.json(kanbanCard);
        } else {
          return res.status(404).json({ message: "Колонна не найдена" });
        }
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
  /*  try { */
  const project = await ProjectModel.findById(req.params.idProject);
  if (project) {
    const participant = project?.participants?.find(
      (participant) => participant?.user?.toString() === req.userId
    );
    if (participant && participant?.role !== "viewer") {
      await kanbanCardModel
        .findByIdAndUpdate(
          req.body.idKanbanCard,
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

      /*   return res.json(kanbanCard); */
    } else {
      return res.status(401).json({ message: "У вас недостаточно прав " });
    }
  } else {
    return res.status(500).json({ message: "Проект не найден" });
  }
  /*   } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Не удалось создать задачу",
    });
  } */
};
export const deleteKanbanCard = async (req, res) => {
  try {
    await ProjectModel.findOne({ _id: req.params.idProject })
      .then(async (project) => {
        const participant = project?.participants?.find(
          (participant) => participant?.user?.toString() === req.userId
        );

        if (participant && participant?.role !== "viewer") {
          for (var i = 0; i < project.columns.length; i++) {
            if (project.columns[i].columnId === req.body.idColumn) {
              for (let j = 0; j < project.columns[i].kanbanCards.length; j++) {
                if (
                  project.columns[i].kanbanCards[j] == req.body.idKanbanCard
                ) {
                  const indexCardId = project.columns[i].kanbanCards.indexOf(
                    project.columns[i].kanbanCards[j]
                  );

                  project.columns[i].kanbanCards.splice(indexCardId, 1);

                  await project.save();
                  return res
                    .status(200)
                    .json({ message: "Задание успешно удалено" });
                } else {
                  return res
                    .status(404)
                    .json({ message: "Задание не найдено" });
                }
              }
            }
          }
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
};
