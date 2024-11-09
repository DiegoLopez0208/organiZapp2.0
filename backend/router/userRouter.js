import { Router } from 'express'
import { userController } from '../controllers/userController.js'

export const userRoutes = () => {
  const userRouter = Router()

  const { getUser, getUserById, createUser, updateUser, deleteUser } = userController()

  userRouter.route('/user')
    .get(getUser)
    .post(createUser)

  userRouter.route('/user/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser)

  return userRouter
}
