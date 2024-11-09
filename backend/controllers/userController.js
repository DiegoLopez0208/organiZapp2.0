import prisma from '../database/prisma.js'
import addSoftDelete from '../middleware/softDelete.js'
import httpStatus from '../helpers/httpStatus.js'
import bcrypt from 'bcrypt'

export const userController = () => {
  const deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params
      prisma.$use(addSoftDelete)
      const userDeleted = await prisma.user.delete({
        where: {
          id: Number(id)
        }
      })
      res.status(httpStatus.OK).json({
        success: true,
        message: 'User Deleted',
        data: userDeleted
      })
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const updateUser = async (req, res, next) => {
    try {
      const { id } = req.params
      const { username, email, password } = req.body
      const userUpdated = await prisma.user.update({
        where: {
          id: Number(id)
        },
        data: {
          username,
          email,
          password: await bcrypt.hash(password, 10)
        }
      })
      res.status(httpStatus.OK).json({
        success: true,
        message: 'User Updated',
        data: userUpdated
      })
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const getUser = async (_req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null
        }
      })
      res.status(httpStatus.OK).json(users)
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const getUserById = async (req, res, next) => {
    try {
      const { id } = req.params
      const user = await prisma.user.findFirst({
        where: {
          id: Number(id),
          deletedAt: null
        },
        include: {
          tasks: true
        }
      })
      res.status(httpStatus.OK).json(user)
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const createUser = async (req, res, next) => {
    try {
      const { username, email, password, birthDate } = req.body
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          birthDate: new Date(birthDate)
        }
      })
      return res.status(httpStatus.CREATED).json({
        success: true,
        data: user,
        message: 'User Created'
      })
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  return {
    updateUser,
    deleteUser,
    getUser,
    getUserById,
    createUser
  }
}
