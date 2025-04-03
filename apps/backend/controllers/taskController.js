import prisma from "../database/prisma.js";
import addSoftDelete from "../middleware/softDelete.js";
import httpStatus from "../helpers/httpStatus.js";

export const taskController = () => {
  const deleteTask = async (req, res, next) => {
    try {
      const { id } = req.params;
      prisma.$use(addSoftDelete);
      const taskDeleted = await prisma.tasks.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(httpStatus.OK).json({
        success: true,
        message: "Task Deleted",
        data: taskDeleted,
      });
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const updateTask = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { taskName, title, date, status } = req.body;
      const taskUpdated = await prisma.tasks.update({
        where: {
          id: Number(id),
        },
        data: { taskName, title, date, status },
      });
      res.status(httpStatus.OK).json({
        success: true,
        message: "Task Updated",
        data: taskUpdated,
      });
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const getTasks = async (_req, res, next) => {
    try {
      const tasks = await prisma.tasks.findMany();
      return res.status(httpStatus.OK).json(tasks);
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const getTaskById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const task = await prisma.tasks.findUnique({
        where: {
          id: Number(id),
        },
      });
      return res.status(httpStatus.OK).json(task);
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const createTask = async (req, res, next) => {
    try {
      const { userId, taskName, title, date, status } = req.body;
      const task = await prisma.tasks.create({
        data: {
          userId,
          taskName,
          title,
          date: new Date(date),
          status,
        },
      });

      return res.status(httpStatus.CREATED).json(task);
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  return {
    updateTask,
    deleteTask,
    getTasks,
    getTaskById,
    createTask,
  };
};
