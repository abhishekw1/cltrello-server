import { Request } from "express";
import { UserDocument } from "./user.interface";

export interface ExpressRequetsInterface extends Request {
  user?: UserDocument;
}
