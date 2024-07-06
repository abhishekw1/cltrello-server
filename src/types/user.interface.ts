import { Document } from "mongoose";

export interface User {
  email: string;
  username: string;
  password: string;
  createdAt: Date;
}
// Document will provide default mongoose schema with _id
// so we don't required to provide in above interface user
export interface UserDocument extends User, Document {
  validatePassword(param: string): Promise<boolean>;
}
