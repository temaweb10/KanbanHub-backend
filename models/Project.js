import mongoose from "mongoose";
const Schema = mongoose.Schema;

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
  columns: {
    type: Array,
    default: [
      {
        name: "К выполнению",
        columnId: "forExecution",
      },
      {
        name: "Ожидание",
        columnId: "expectation",
      },
      {
        name: "В работе",
        columnId: "atWork",
      },
      {
        name: "Готово",
        columnId: "finished",
      },
    ],
  },

  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
      role: String,
    },
  ],
  kanbanCards: [
    { kanbanCardId: { type: Schema.Types.ObjectId, ref: "KanbanCard" } },
  ],
});

// role: admin , member , viewer

export default mongoose.model("Project", ProjectSchema);
