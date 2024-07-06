import { NextFunction, Response } from "express";
import { secret } from "../config";
import UserModel from "../models/user";
import jwt from "jsonwebtoken";
import { ExpressRequetsInterface } from "../types/expressRequest.interface";

export default async (
  req: ExpressRequetsInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(" ")[1];
    const data = jwt.verify(token, secret) as { id: string; email: string };
    const user = await UserModel.findById(data.id);

    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;

    next();
  } catch (error) {
    res.sendStatus(401);
  }
};
