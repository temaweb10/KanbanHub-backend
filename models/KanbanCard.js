import mongoose from "mongoose";
const Schema = mongoose.Schema;

const KanbanCardSchema = new Schema({
  nameProject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      text: String,
    },
  ],
  executor: { type: Schema.Types.ObjectId, ref: "User" },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model("KanbanCard", KanbanCardSchema);
