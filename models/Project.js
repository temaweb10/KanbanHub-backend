import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  nameProject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      role: String,
    },
  ],
  KanbanCard: [{ type: Schema.Types.ObjectId, ref: "KanbanCard" }],
});

export default mongoose.model("Project", ProjectSchema);
