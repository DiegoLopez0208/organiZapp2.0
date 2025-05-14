import prisma from "../database/prisma.js";
import httpStatus from "../helpers/httpStatus.js";
import logger from "../helpers/winston.js";
import chalk from "chalk";
import { fileURLToPath } from "url";
import path from "path";

const fullPath = fileURLToPath(import.meta.url);
const fileName = path.basename(fullPath);
const nameYellow = chalk.yellow(fileName);

export const groupController = () => {
  const updateGroup = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, updatedAt, deletedAt } = req.body;
      const groupUpdated = await prisma.group.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          updatedAt,
          deletedAt,
        },
      });
      res.status(httpStatus.OK).json({
        success: true,
        message: "Group Updated",
        data: groupUpdated,
      });
    } catch (error) {
      logger.error(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const getGroups = async (_req, res) => {
    try {
      const groups = await prisma.group.findMany();
      return res.status(httpStatus.OK).json(groups);
    } catch (error) {
      logger.error(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const getGroupById = async (groupId) => {
    try {
      const group = await prisma.group.findUnique({
        where: {
          id: Number(groupId),
        },
      });
      return group;
    } catch (error) {
      logger.error(error);
    } finally {
      await prisma.$disconnect();
    }
  };
  const deleteGroup = async (groupId) => {
    try {
      const messagesDeleted = await prisma.message.deleteMany({
        where: {
          groupId: Number(groupId),
        },
      });
      if (messagesDeleted.count > 0) {
        logger.info(`Messages deleted: ${messagesDeleted.count}`);
      }
      const groupDeleted = await prisma.group.delete({
        where: {
          id: Number(groupId),
        },
      });
      if (groupDeleted) {
        logger.info(`Group Deleted: ${JSON.stringify(groupDeleted)}`);
      }
    } catch (error) {
      logger.error(`Error deleting group and messages: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  };

  const createGroup = async (groupData) => {
    logger.info(`GroupData:${groupData}.Archivo: ${nameYellow}`);
    try {
      const newGroup = await prisma.group.create({
        data: {
          name: groupData.name,
        },
      });

      return {
        success: true,
        message: "Group Created",
        data: newGroup,
      };
    } catch (error) {
      logger.error(error);
      return {
        success: false,
        message: "Error al crear el grupo",
        error: error.message,
      };
    } finally {
      await prisma.$disconnect();
    }
  };

  return {
    updateGroup,
    deleteGroup,
    getGroups,
    getGroupById,
    createGroup,
  };
};
