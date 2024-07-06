import { Schema } from "mongoose";

export interface Column {
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: Schema.Types.ObjectId;
  boardId: Schema.Types.ObjectId;
}

export interface ColumnDocument extends Column, Document {}
