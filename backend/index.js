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
import path from "path";
import chalk from "chalk";

dotenv.config();
const PORT = process.env.PORT || 4000;
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};
const fullPath = import.meta.filename;
const fileName = path.basename(fullPath);
const nameYellow = chalk.yellow(fileName);

const app = express();
let groups = [];

const loadGroupsFromDatabase = async () => {
  const dbGroups = await prisma.group.findMany();
  groups = [...dbGroups];
};

const loadData = async () => {
  await loadGroupsFromDatabase();
  return groups;
};

loadData().then((groups) => {
  logger.info(`Grupos cargados correctamente: ${groups.length}`);
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  jwt({
    secret: process.env.SECRET_KEY,
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/api/auth/login",
      "/api/auth/refresh",
      "/api/auth/register",
      "/socket.io/",
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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  logger.info(
    `Un cliente se ha conectado: ${socket.id}. Archivo: ${nameYellow}`,
  );
  socket.emit("get_groups", groups);

  socket.on("create_group", async (groupData) => {
    if (!groupData || !groupData.name) {
      logger.error(`Datos del grupo inválidos. Archivo: ${nameYellow}`);
      return;
    }
    try {
      const { data } = await groupController().createGroup(groupData);
      if (data) {
        groups.push(data);
        socket.join(data.id);
        io.emit("groups_updated", groups);
      }
    } catch (error) {
      console.error(
        `Error al crear el grupo: ${error}. Archivo: ${nameYellow}`,
      );
    }
  });
  socket.on("delete_group", async (groupId) => {
    try {
      if (!groupId) {
        logger.error("El ID del grupo no se proporcionó o es inválido.");
        return;
      }
      await groupController().deleteGroup(groupId);
      logger.info(`Grupo con ID ${groupId} eliminado exitosamente.`);
    } catch (error) {
      logger.error(
        `Error al eliminar el grupo con ID ${groupId}: ${error.message}`,
      );
    }
  });
  socket.on("join_group", async (groupId) => {
    if (!groupId) {
      logger.info("ID del grupo no proporcionado.");
      return;
    }

    try {
      const group = await groupController().getGroupById(groupId);
      const messages = await messageController().getMessagesByGroup(groupId); // Asegúrate de que este método retorne un arreglo
      if (group) {
        socket.join(groupId);
        logger.info(`Usuario ${socket.id} se unió al grupo: ${group.name}.`);

        io.to(groupId).emit("new_member", {
          userId: socket.id,
          groupId: group.groupId,
        });
        io.to(groupId).emit("update_message", {
          messagesIndex: messages.map((message) => ({
            senderName: message.senderName,
            text: message.content,
            recipientName: null,
            groupId,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
        });
      } else {
        logger.info("Grupo no encontrado.");
      }
    } catch (error) {
      logger.error(`Error al unirse al grupo: ${error}`);
    }
  });

  socket.on("send_message", async (data) => {
    const { groupId, text, senderName } = data;
    if (!groupId || !text) {
      logger.info(`Datos de mensaje no válidos. Archivo: ${nameYellow}`);
      return;
    }
    logger.info(data);
    const messageData = {
      content: text,
      senderName,
      receiverId: null, // ????
      groupId,
    };
    try {
      const group = await groupController().getGroupById(groupId);
      if (group) {
        const newMessage = await messageController().sendMessage(
          socket,
          messageData,
        );
        logger.info(
          ` Mensaje: ${JSON.stringify(newMessage.content)}. Archivo: ${nameYellow}`,
        );
        io.to(groupId).emit("new_message", {
          text: newMessage.content, // El contenido del mensaje
          senderName, // Nombre del usuario que envió el mensaje
          recipientName: null, // Deja este campo en `null` si es un grupo
          groupId, // ID del grupo donde se envió el mensaje
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }), // Hora en formato legible
        });
      } else {
        logger.info(
          `Grupo no encontrado para enviar el mensaje. Archivo: ${nameYellow}`,
        );
      }
    } catch (error) {
      console.error(
        `Error al enviar el mensaje: ${error}. Archivo: ${nameYellow}`,
      );
    }
  });

  socket.on("disconnect", () => {
    logger.info(
      `Un usuario se ha desconectado: ${socket.id}. Archivo: ${nameYellow}`,
    );
  });
});

server.listen(PORT, () => {
  logger.info(
    `Backend ejecutándose en el puerto ${PORT}. Archivo: ${nameYellow}`,
  );
});
