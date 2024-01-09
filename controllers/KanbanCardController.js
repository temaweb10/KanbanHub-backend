import kanbanCardModel from "../models/kanbanCard";

export const createKanbanCard = async (req, res) => {
  try {
    const doc = new kanbanCardModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();

    res.json({ post });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось выложить пост",
    });
  }
};
