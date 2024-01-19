import mongoose from "mongoose";
const Schema = mongoose.Schema;

const columnSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  columnId: {
    type: String,
    required: true,
    unique: true,
  },
  kanbanCards: [
    {
      type: Schema.Types.ObjectId,
      ref: "KanbanCard",
    },
  ],
});

const ProjectSchema = new Schema({
  nameProject: {
    type: String,
    required: true,
  },

  code: {
    type: String,
    required: true,
    unique: true,
  },
  kanbanCardsLength: {
    type: Number,
    default: 0,
  },

  columns: {
    type: [columnSchema],
    default: [
      {
        name: "Готово",
        columnId: "finished",
        kanbanCards: [],
      },
      {
        name: "В работе",
        columnId: "atWork",
        kanbanCards: [],
      },
      {
        name: "Ожидание",
        columnId: "expectation",
        kanbanCards: [],
      },
      {
        name: "Готово",
        columnId: "finished",
        kanbanCards: [],
      },
    ],
  },

  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      role: String,
    },
  ],
});

// role: admin , member , viewer

export default mongoose.model("Project", ProjectSchema);
