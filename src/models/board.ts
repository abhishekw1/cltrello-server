import { model, Schema } from "mongoose";
import { BoardDocument } from "../types/board.interface";

const boardSchema = new Schema<BoardDocument>({
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export default model<BoardDocument>("Bord", boardSchema);
