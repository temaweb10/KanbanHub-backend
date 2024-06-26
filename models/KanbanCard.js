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
    default: "none",
  },
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      text: String,
    },
  ],
  executor: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tags: {
    type: Array,
    default: [],
  }
});
/* priority:|| low , medium , high , freez,none  */
export default mongoose.model("KanbanCard", KanbanCardSchema);
