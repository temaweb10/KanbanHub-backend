import mongoose from "mongoose";
const Schema = mongoose.Schema;

const KanbanCardSchema = new Schema({
  nameCard: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    /*     required: true, */
  },
  columnId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  /*  codeNum: {
    type: String,
    required: true,
  }, */
  priority: {
    type: String,
    default: "low",
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
/* priority:|| low , medium , high , freez  */
export default mongoose.model("KanbanCard", KanbanCardSchema);
