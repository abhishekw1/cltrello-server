import { NextFunction, Response } from "express";
import ColumnModel from "../models/column";
import { ExpressRequetsInterface } from "../types/expressRequest.interface";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEvent.enum";
import { getErrorMessage } from "../healpers";

// Api controllers
export const getColumns = async (
  req: ExpressRequetsInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const columns = await ColumnModel.find({ boardId: req.params.boardId });
    res.send(columns);
  } catch (error) {
    next(error);
  }
};

export const createColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; title: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.columnsCreateFailure,
        "User is not authorized"
      );
      return;
    }
    const newColumn = new ColumnModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user.id,
    });
    const savedColumn = await newColumn.save();
    io.to(data.boardId).emit(
      SocketEventsEnum.columnsCreateSuccess,
      savedColumn
    );
    console.log("savedColumn", savedColumn);
  } catch (error) {
    socket.emit(SocketEventsEnum.columnsCreateFailure, getErrorMessage(error));
  }
};
export const updateColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; columnId: string; feilds: { title: string } }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.columnsUpdateFailure,
        "User is not authorized"
      );
    }
    const updatedColumn = await ColumnModel.findByIdAndUpdate(
      data.columnId,
      data.feilds,
      { new: true }
    );
    io.to(data.boardId).emit(
      SocketEventsEnum.columnsUpdateSuccess,
      updatedColumn
    );
  } catch (error) {
    socket.emit(SocketEventsEnum.columnsUpdateFailure, getErrorMessage(error));
  }
};
export const deleteColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; columnId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.columnsDeleteFailure,
        "User is not authorized"
      );
    }
    await ColumnModel.deleteOne({ _id: data.columnId });
    io.to(data.boardId).emit(
      SocketEventsEnum.columnsDeleteSuccess,
      data.columnId
    );
  } catch (error) {
    socket.emit(SocketEventsEnum.columnsDeleteFailure, getErrorMessage(error));
  }
};
