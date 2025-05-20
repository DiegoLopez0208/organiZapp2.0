import prisma from "../database/prisma.js";
import logger from "../helpers/winston.js";

import chalk from "chalk";

import { fileURLToPath } from "url";
import path from "path";

const fullPath = fileURLToPath(import.meta.url);
const fileName = path.basename(fullPath);
const nameYellow = chalk.yellow(fileName);

export const messageController = () => {
  const getMessagesByGroup = async (groupId) => {
    try {
      const messageGroupInfo = await prisma.message.findMany({
        where: {
          groupId: Number(groupId),
        },
        include: {
          sender: { select: { username: true, image: true } },
        },
      });

      const messagesWithSenderInfo = messageGroupInfo.map((message) => ({
        ...message,
        senderName: message.sender ? message.sender.username : "Desconocido",
        senderImage: message.sender ? message.sender.image : null,
      }));
      return messagesWithSenderInfo;
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
      select: { id: true, username: true, image: true },
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
        include: {
          sender: { select: { username: true, image: true } },
        },
      });
      logger.info(
        `Message Created by: ${JSON.stringify(newMessage)}. Archivo: ${nameYellow}`,
      );

      const messageWithSenderInfo = {
        ...newMessage,
        senderName: newMessage.sender ? newMessage.sender.username : "Desconocido",
        senderImage: newMessage.sender ? newMessage.sender.image : null,
      };

      if (groupId) {
        socket.to(groupId).emit("chat_message", messageWithSenderInfo);
      } else if (receiverId) {
        socket.to(receiverId).emit("private_message", messageWithSenderInfo);
      }
      return messageWithSenderInfo;
    } catch (error) {
      return error;
    }
  };
  return {
    sendMessage,
    getMessagesByGroup,
  };
};
