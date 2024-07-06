import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Error } from "mongoose";
import UserModel from "../models/user";
import { UserDocument } from "../types/user.interface";
import { secret } from "../config";
import { ExpressRequetsInterface } from "../types/expressRequest.interface";

const normaliseUser = (user: UserDocument) => {
  const token = jwt.sign({ id: user.id, email: user.email }, secret);
  return {
    email: user.email,
    username: user.username,
    id: user.id,
    token: `Bearer ${token}`,
  };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newUser = new UserModel({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });
    // console.log("newUser", newUser);
    const saveUser = await newUser.save();
    // console.log("saveUser", saveUser);
    res.send(normaliseUser(saveUser));
  } catch (err) {
    if (err instanceof Error.ValidationError) {
      const messages = Object.values(err.errors).map((err) => err.message);
      return res.status(422).json(messages);
    }
    next(err as Error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findOne({
      email: req.body.email,
    }).select("+password"); // password is initial is select false so we need to use select for the comparison purpose

    const errors = { emailOrPassword: "Incorrect email or password" };
    if (!user) {
      return res.status(422).json(errors);
    }

    const isSamePassword = await user.validatePassword(req.body.password);
    if (!isSamePassword) {
      return res.status(422).json(errors);
    }

    res.send(normaliseUser(user));
  } catch (err) {
    next(err);
  }
};

export const currentUser = (req: ExpressRequetsInterface, res: Response) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  res.send(normaliseUser(req.user));
};
