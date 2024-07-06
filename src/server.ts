import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "./types/socket.interface";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import authMiddleware from "./middlewares/auth";
import * as userController from "./controllers/users";
import * as boardsController from "./controllers/boards";
import * as columnsController from "./controllers/columns";
import * as tasksController from "./controllers/tasks";
import { SocketEventsEnum } from "./types/socketEvent.enum";
import { secret } from "./config";
import UserModel from "./models/user";
// exress server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("toJSON", {
  virtuals: true,
  transform: (_, converted) => {
    delete converted._id;
  },
});

app.get("/", (req, res) => {
  res.send("API is UP");
});

app.post("/api/users", userController.register);
app.post("/api/users/login", userController.login);

// always use middleware before the controller to authenticate user
app.get("/api/user", authMiddleware, userController.currentUser);
app.get("/api/boards", authMiddleware, boardsController.getBoards);
app.get("/api/boards/:boardId", authMiddleware, boardsController.getBoard);
app.get(
  "/api/boards/:boardId/columns",
  authMiddleware,
  columnsController.getColumns
);
app.get("/api/boards/:boardId/tasks", authMiddleware, tasksController.getTasks);
app.post("/api/boards", authMiddleware, boardsController.createBoards);

// All socket related operations
io.use(async (socket: Socket, next) => {
  try {
    const token = (socket.handshake.auth.token as string) ?? "";
    const data = jwt.verify(token.split(" ")[1], secret) as {
      id: string;
      email: string;
    };
    const user = await UserModel.findById(data.id);
    if (!user) {
      return next(new Error("Authentication Error"));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication Error"));
  }
}).on("connection", (socket) => {
  socket.on(SocketEventsEnum.boardsJoin, (data) => {
    boardsController.joinBoards(io, socket, data);
  });
  socket.on(SocketEventsEnum.boardsLeave, (data) => {
    boardsController.leaveBoards(io, socket, data);
  });
  socket.on(SocketEventsEnum.boardsUpdate, (data) => {
    boardsController.updateBoard(io, socket, data);
  });
  socket.on(SocketEventsEnum.boardsDelete, (data) => {
    boardsController.deleteBoard(io, socket, data);
  });
  socket.on(SocketEventsEnum.columnsCreate, (data) => {
    columnsController.createColumn(io, socket, data);
  });
  socket.on(SocketEventsEnum.columnsUpdate, (data) => {
    columnsController.updateColumn(io, socket, data);
  });
  socket.on(SocketEventsEnum.columnsDelete, (data) => {
    columnsController.deleteColumn(io, socket, data);
  });
  socket.on(SocketEventsEnum.boardsDelete, (data) => {
    columnsController.deleteColumn(io, socket, data);
  });
  socket.on(SocketEventsEnum.tasksCreate, (data) => {
    tasksController.createTask(io, socket, data);
  });
  socket.on(SocketEventsEnum.tasksUpdate, (data) => {
    tasksController.updateTask(io, socket, data);
  });
  socket.on(SocketEventsEnum.tasksDelete, (data) => {
    tasksController.deleteTask(io, socket, data);
  });
});

// first check the connection with mongo db and then start the server
mongoose
  .connect(`mongodb://localhost:27017/cltrello`)
  .then(() => {
    console.log("connected to mongodb");
    httpServer.listen(4001, () => {
      console.log(`API is listening on port 4001`);
    });
  })
  .catch((err) => {
    console.log("connection to mongodb fail");
  });
