import prisma from "../database/prisma.js";
import logger from "../helpers/winston.js";
import path from "path";
import chalk from "chalk";

const fullPath = import.meta.filename;
const fileName = path.basename(fullPath);
const nameYellow = chalk.yellow(fileName);

export const messageController = () => {
  const getMessagesByGroup = async (groupId) => {
    try {
      // Obtener todos los mensajes del grupo
      const messageGroupInfo = await prisma.message.findMany({
        where: {
          groupId: Number(groupId),
        },
        include: {
          sender: { select: { username: true } },
        },
      });

      const messagesWithSenderName = messageGroupInfo.map((message) => ({
        ...message,
        senderName: message.sender ? message.sender.username : "Desconocido",
      }));
      return messagesWithSenderName;
    } catch (error) {
      logger.error(`Error al obtener mensajes: ${error.message}`);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  };

  const sendMessage = async (socket, data) => {
    const { senderName, content, receiverId, groupId } = data;

    const sender = await prisma.user.findUnique({
      where: { username: senderName },
    });
    if (!sender) {
      return logger.error("El usuario no existe: ", senderName);
    }

    try {
      const newMessage = await prisma.message.create({
        data: {
          group: { connect: { id: groupId } },
          content,
          sender: {
            connect: { id: sender.id },
          },
        },
      });
      logger.info(
        `Message Created by: ${JSON.stringify(newMessage)}. Archivo: ${nameYellow}`,
      );

      if (groupId) {
        socket.to(groupId).emit("chat_message", newMessage);
      } else if (receiverId) {
        socket.to(receiverId).emit("private_message", newMessage);
      }
      return newMessage;
    } catch (error) {
      return error;
    }
  };
  return {
    sendMessage,
    getMessagesByGroup,
  };
};
