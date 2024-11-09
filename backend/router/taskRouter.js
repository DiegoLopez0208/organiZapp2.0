import { Router } from 'express'
import { taskController } from '../controllers/taskController.js'
import { taskValidation, taskParamsValidation, userValidation, userParamsValidation } from '../middleware/validations.js'

export const taskRoutes = () => {
  const taskRouter = Router()
  const { getTask, getTaskById, createTask, updateTask, deleteTask } = taskController()

  taskRouter.route('/task')
    .get(getTask)
    .post(userParamsValidation, userValidation, createTask)

  taskRouter.route('/task/:id')
    .get(getTaskById)
    .put(taskParamsValidation, taskValidation, updateTask)
    .delete(deleteTask)

  return taskRouter
}
