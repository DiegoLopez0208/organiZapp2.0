import prisma from "../database/prisma.js";
import httpStatus from "../helpers/httpStatus.js";

export const taskController = () => {
  const createTask = async (req, res, next) => {
    try {
      const {
        userId,
        taskName,
        title,
        description,
        date,
        status,
        startTime,
        endTime
      } = req.body;

      if (!userId || !title || !status || !taskName) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "userId, taskName, title and status are required"
        });
      }

      const taskData = {
        userId: Number(userId),
        taskName,
        title,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        status
      };

      if (startTime) taskData.startTime = new Date(startTime);
      if (endTime) taskData.endTime = new Date(endTime);

      const task = await prisma.tasks.create({ data: taskData });

      res.status(httpStatus.CREATED).json({
        success: true,
        message: "Task created successfully",
        data: task
      });
    } catch (error) {
      if (error.code === 'P2003') {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid user ID"
        });
      }
      next(error);
    }
  };

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      taskName,
      title,
      description,
      date,
      status,
      startTime,
      endTime
    } = req.body;

    if (!title || !status || !taskName) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "taskName, title, and status are required"
      });
    }

    const updateData = {
      taskName,
      title,
      description: description || '',
      status,
    };

    if (date) updateData.date = new Date(date);
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);

    const taskUpdated = await prisma.tasks.update({
      where: { id: Number(id) },
      data: updateData
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Task updated successfully",
      data: taskUpdated
    });
  } catch (error) {

    if (error.code === 'P2025') {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Task not found"
      });
    }

    next(error);
  }
};

  const deleteTask = async (req, res, next) => {
    try {
      const { id } = req.params;

      const task = await prisma.tasks.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }
      });

      res.status(httpStatus.OK).json({
        success: true,
        message: "Task deleted successfully",
        data: task
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: "Task not found"
        });
      }
      next(error);
    }
  };

  const getTasks = async (req, res, next) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "userId is required"
        });
      }

      const tasks = await prisma.tasks.findMany({
        where: {
          deletedAt: null,
          userId: Number(userId)
        },
        orderBy: { date: 'asc' }
      });

      res.status(httpStatus.OK).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error interno en getTasks",
        error: error.message
      });
    }
  };

  const getTaskById = async (req, res, next) => {
    try {
      const { id } = req.params;

      const task = await prisma.tasks.findFirst({
        where: {
          id: Number(id),
          deletedAt: null
        }
      });

      if (!task) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: "Task not found"
        });
      }

      res.status(httpStatus.OK).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    getTasks,
    getTaskById
  };
};
