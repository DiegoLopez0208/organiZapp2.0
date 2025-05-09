import { Router } from "express";
import { taskController } from "../controllers/taskController.js";
import {
  taskValidation,
  taskParamsValidation,
  updateTaskValidation,
} from "../middleware/validations.js";

export const taskRoutes = () => {
  const taskRouter = Router();
  const { createTask, deleteTask, getTaskById, getTasks, updateTask } =
    taskController();

  taskRouter
    .route("/task")
    .get(getTasks)
    .post(taskValidation, createTask);

  taskRouter
    .route("/task/:id")
    .get(getTaskById)
    .put(taskParamsValidation, updateTaskValidation, updateTask)
    .delete(deleteTask);

  return taskRouter;
};
