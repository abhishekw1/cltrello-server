import { NextFunction, Response } from "express";
import BoardModel from "../models/board";
import { ExpressRequetsInterface } from "../types/expressRequest.interface";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEvent.enum";
import { getErrorMessage } from "../healpers";

// Api controllers
export const getBoards = async (
  req: ExpressRequetsInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const boards = await BoardModel.find({ userId: req.user.id });
    res.send(boards);
  } catch (error) {
    next(error);
  }
};

export const createBoards = async (
  req: ExpressRequetsInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const newBoard = new BoardModel({
      title: req.body.title,
      userId: req.user.id,
    });

    const savedBoard = await newBoard.save();
    res.send(savedBoard);
  } catch (error) {
    next(error);
  }
};

export const getBoard = async (
  req: ExpressRequetsInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const boardId = req.params.boardId;
    const board = await BoardModel.findById(boardId);
    res.send(board);
  } catch (error) {
    next(error);
  }
};

// socket controllers
export const joinBoards = (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  // console.log("Board Joined", socket.user);
  socket.join(data.boardId);
};
export const leaveBoards = (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  // console.log("Board leave", data.boardId);
  socket.leave(data.boardId);
};

export const updateBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; feilds: { title: string } }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.boardsUpdateFailure,
        "User is not authorized"
      );
    }
    const updatedBoard = await BoardModel.findByIdAndUpdate(
      data.boardId,
      data.feilds,
      { new: true }
    );
    io.to(data.boardId).emit(
      SocketEventsEnum.boardsUpdateSuccess,
      updatedBoard
    );
  } catch (error) {
    socket.emit(SocketEventsEnum.boardsUpdateFailure, getErrorMessage(error));
  }
};
export const deleteBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.boardsDeleteFailure,
        "User is not authorized"
      );
    }
    await BoardModel.deleteOne({ _id: data.boardId });
    io.to(data.boardId).emit(SocketEventsEnum.boardsDeleteSuccess);
  } catch (error) {
    socket.emit(SocketEventsEnum.boardsDeleteFailure, getErrorMessage(error));
  }
};
