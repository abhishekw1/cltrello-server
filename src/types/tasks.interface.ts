import { Schema } from "mongoose";

export interface Task {
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: Schema.Types.ObjectId;
  boardId: Schema.Types.ObjectId;
  columnId: Schema.Types.ObjectId;
}

export interface TaskDocument extends Task, Document {}
