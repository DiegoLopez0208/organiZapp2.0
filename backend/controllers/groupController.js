import prisma from '../database/prisma.js'
import addSoftDelete from '../middleware/softDelete.js'
import httpStatus from '../helpers/httpStatus.js'
import logger from '../helpers/winston.js'
import path from 'path'
import chalk from 'chalk'

const fullPath = import.meta.filename
const fileName = path.basename(fullPath)
const nameYellow = chalk.yellow(fileName)

export const groupController = () => {
  const deleteGroup = async (req, res) => {
    try {
      const { id } = req.params
      prisma.$use(addSoftDelete) // Usar el middleware para soft delete
      const groupDeleted = await prisma.group.delete({
        where: {
          id: Number(id)
        }
      })
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Group Deleted',
        data: groupDeleted
      })
    } catch (error) {
      logger.error(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const updateGroup = async (req, res) => {
    try {
      const { id } = req.params
      const { name, updatedAt, deletedAt } = req.body
      const groupUpdated = await prisma.group.update({
        where: {
          id: Number(id)
        },
        data: {
          name,
          updatedAt,
          deletedAt
        }
      })
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Group Updated',
        data: groupUpdated
      })
    } catch (error) {
      logger.error(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const getGroups = async (_req, res) => {
    try {
      const groups = await prisma.group.findMany()
      return res.status(httpStatus.OK).json(groups)
    } catch (error) {
      logger.error(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const getGroupById = async (groupId) => {
    try {
      const group = await prisma.group.findUnique({
        where: {
          id: Number(groupId)
        }
      })
      return group
    } catch (error) {
      logger.error(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const createGroup = async (groupData) => {
    logger.info(`GroupData:${groupData}.Archivo: ${nameYellow}`)
    try {
      if (!groupData.name) {
        return ({
          success: false,
          message: 'El nombre del grupo es requerido'
        })
      }

      const newGroup = await prisma.group.create({
        data: {
          name: groupData.name
        }
      })

      return ({
        success: true,
        message: 'Group Created',
        data: newGroup
      })
    } catch (error) {
      logger.error(error)
      return {
        success: false,
        message: 'Error al crear el grupo',
        error: error.message
      }
    } finally {
      await prisma.$disconnect()
    }
  }

  return {
    updateGroup,
    deleteGroup,
    getGroups,
    getGroupById,
    createGroup
  }
}
