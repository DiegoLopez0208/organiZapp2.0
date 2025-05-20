import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { expressjwt as jwt } from "express-jwt";
import errorHandler from "./middleware/errorHandler.js";
import { userRoutes } from "./router/userRouter.js";
import { taskRoutes } from "./router/taskRouter.js";
import { authRoutes } from "./router/authRouter.js";
import { groupRoutes } from "./router/groupRouter.js";
import { messageRoutes } from "./router/messsageRouter.js";
import { groupController } from "./controllers/groupController.js";
import { messageController } from "./controllers/messageController.js";
import prisma from "./database/prisma.js";
import logger from "./helpers/winston.js";
import { fileURLToPath } from "url";
import path from "path";

import chalk from "chalk";

dotenv.config();
const PORT = process.env.PORT || 4000;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};
const fullPath = fileURLToPath(import.meta.url);
const fileName = path.basename(fullPath);
const nameYellow = chalk.yellow(fileName);

const app = express();
let groups = [];

const fetchGroups = async () => {
  const groups = await groupController().getGroupsWithLastMessage();
  io.emit("groups_updated", groups);
};

const loadData = async () => {
  await fetchGroups();
};

loadData().then(() => {
  logger.info(`Grupos cargados correctamente: ${groups.length}`);
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    requestProperty: "auth",
    getToken: (req) => {
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        return req.headers.authorization.split(" ")[1];
      }
      return null;
    },
  }).unless({
    path: [
      "/api/auth/login",
      "/api/auth/refresh",
      "/api/auth/register",
      "/socket.io/",
      "/api/auth/oauth-login",
    ],
  }),
);

app.use(
  "/api",
  authRoutes(),
  userRoutes(),
  taskRoutes(),
  groupRoutes(),
  messageRoutes(),
);

app.use(errorHandler);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  logger.info(`Cliente conectado: ${socket.id}. Archivo: ${nameYellow}`);
  socket.emit("get_groups", groups);
  socket.on("get_groups", async () => {
    try {
      const dbGroups = await groupController().getGroupsWithLastMessage();
      groups = [...dbGroups];
      socket.emit("groups_updated", groups);
    } catch (error) {
      console.error("Error al obtener grupos:", error);
    }
  });

  socket.on("create_group", async (groupData) => {
    if (!groupData?.name) {
      logger.error(`Datos del grupo inválidos. Archivo: ${nameYellow}`);
      return;
    }
    try {
      const { data } = await groupController().createGroup(groupData);
      if (data) {
        groups.push(data);
        socket.join(data.id);
        fetchGroups();
      }
    } catch (error) {
      console.error(
        `Error al crear el grupo: ${error}. Archivo: ${nameYellow}`,
      );
    }
  });

  socket.on("delete_group", async (groupId) => {
    if (!groupId) return logger.error("ID del grupo inválido.");
    try {
      await groupController().deleteGroup(groupId);
      groups = groups.filter((group) => group.id !== groupId);
      fetchGroups();
    } catch (error) {
      logger.error(`Error al eliminar el grupo: ${error.message}`);
    }
  });

  socket.on("join_group", async (groupId) => {
    if (!groupId) return;
    try {
      const group = await groupController().getGroupById(groupId);
      const messages = await messageController().getMessagesByGroup(groupId);
      if (group) {
        socket.join(groupId);
        io.to(groupId).emit("new_member", { userId: socket.id, groupId });
        io.to(groupId).emit("update_message", { messagesIndex: messages });
      }
    } catch (error) {
      logger.error(`Error al unirse al grupo: ${error}`);
    }
  });

  socket.on("send_message", async (data) => {
    console.log("Mensaje recibido en el backend:", data);

    const { groupId, text, senderName } = data;
    if (!groupId || !text) return;

    const messageData = {
      content: text,
      senderName,
      receiverId: null,
      groupId,
    };

    try {
      const newMessage = await messageController().sendMessage(
        socket,
        messageData,
      );
      if (newMessage) {
        const messages = await messageController().getMessagesByGroup(groupId);
        io.to(groupId).emit("update_message", { messagesIndex: messages });
      }
    } catch (error) {
      logger.error(`Error al enviar mensaje: ${error.message}`);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`Usuario desconectado: ${socket.id}. Archivo: ${nameYellow}`);
  });
});

server.listen(PORT, () => {
  logger.info(
    `Backend ejecutándose en el puerto ${PORT}. Archivo: ${nameYellow}`,
  );
});
