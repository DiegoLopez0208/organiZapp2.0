import httpStatus from '../helpers/httpStatus.js'
import prisma from '../database/prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const authController = () => {
  const login = async (req, res, next) => {
    const { username, password } = req.body
    try {
      const user = await prisma.user.findFirst({
        where: { username }
      })

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ message: 'Invalid credentials' })
      }
      const token = jwt.sign(
        {
          name: user.username
        },
        process.env.SECRET_KEY,
        { expiresIn: '10m' }
      )
      const refreshToken = jwt.sign(
        {
          name: user.username
        },
        process.env.SECRET_REFRESH_TOKEN,
        { expiresIn: '1h' }
      )
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken
      })
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }
  const register = async (req, res, next) => {
    try {
      const { username, password, email, birthDate } = req.body
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      const userCreated = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          birthDate: new Date(birthDate)
        }
      })
      res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Register Created',
        data: userCreated
      })
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }
  const refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      const decoded = jwt.verify(
        refreshToken,
        process.env.SECRET_REFRESH_TOKEN
      )

      const token = jwt.sign(
        {
          name: decoded.name
        },
        process.env.SECRET_KEY,
        { expiresIn: '5m' }
      )
      const newRefreshToken = jwt.sign(
        {
          name: decoded.name
        },
        process.env.SECRET_REFRESH_TOKEN,
        { expiresIn: '1h' }
      )
      res.status(httpStatus.OK).json({
        message: 'Token refreshed sucessfully',
        token,
        refreshToken: newRefreshToken
      })
    } catch (error) {
      next(error)
    } finally {
      await prisma.$disconnect()
    }
  }
  return {
    login,
    register,
    refresh
  }
}
