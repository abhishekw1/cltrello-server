import { Response, NextFunction } from "express";
import { ExpressRequetsInterface } from "../types/expressRequest.interface";
import TaskModel from "../models/task";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { getErrorMessage } from "../healpers";
import { SocketEventsEnum } from "../types/socketEvent.enum";

export const getTasks = async (
  req: ExpressRequetsInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const tasks = await TaskModel.find({
      boardId: req.params.boardId,
    });
    res.send(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; title: string; columnId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.tasksCreateFailure,
        "User is not authorized"
      );
      return;
    }
    const newTask = new TaskModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user.id,
      columnId: data.columnId,
    });
    const savedTask = await newTask.save();
    io.to(data.boardId).emit(SocketEventsEnum.tasksCreateSuccess, savedTask);
    console.log("savedTask", savedTask);
  } catch (error) {
    socket.emit(SocketEventsEnum.tasksCreateFailure, getErrorMessage(error));
  }
};

export const updateTask = async (
  io: Server,
  socket: Socket,
  data: {
    boardId: string;
    taskId: string;
    fields: { title: string; description: string; columnId: string };
  }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.tasksUpdateFailure,
        "User is not authorized"
      );
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(
      data.taskId,
      data.fields,
      { new: true }
    );
    io.to(data.boardId).emit(SocketEventsEnum.tasksUpdateSuccess, updatedTask);
  } catch (error) {
    socket.emit(SocketEventsEnum.tasksUpdateFailure, getErrorMessage(error));
  }
};
export const deleteTask = async (
  io: Server,
  socket: Socket,
  data: {
    boardId: string;
    taskId: string;
  }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.tasksUpdateFailure,
        "User is not authorized"
      );
    }
    await TaskModel.deleteOne({ _id: data.taskId });
    io.to(data.boardId).emit(SocketEventsEnum.tasksDeleteSuccess, data.taskId);
  } catch (error) {
    socket.emit(SocketEventsEnum.tasksUpdateFailure, getErrorMessage(error));
  }
};
