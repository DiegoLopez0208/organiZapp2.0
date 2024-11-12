import prisma from '../database/prisma.js'
import addSoftDelete from '../middleware/softDelete.js'
import httpStatus from '../helpers/httpStatus.js'

export const groupController = () => {
  const deleteGroup = async (req, res, next) => {
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
      console.log(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const updateGroup = async (req, res, next) => {
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
      console.log(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const getGroups = async (_req, res, next) => {
    try {
      const groups = await prisma.group.findMany()
      return res.status(httpStatus.OK).json(groups)
    } catch (error) {
      console.log(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const getGroupById = async (req, res) => {
    try {
      const { id } = req.params
      const group = await prisma.group.findUnique({
        where: {
          id: Number(id)
        }
      })
      console.log(group)
      return res.status(httpStatus.OK).json(group)
    } catch (error) {
      console.log(error)
    } finally {
      await prisma.$disconnect()
    }
  }

  const createGroup = async (req, res, next) => {
    try {
      console.log('Datos recibidos:', req.body) // Verifica si los datos llegan correctamente
      const { name, createdAt, updatedAt, deletedAt } = req.body || {}

      // Verifica si 'name' es indefinido o nulo
      if (!name) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'El nombre del grupo es requerido'
        })
      }

      const newGroup = await prisma.group.create({
        data: {
          name,
          createdAt,
          updatedAt,
          deletedAt
        }
      })

      return res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Group Created',
        data: newGroup
      })
    } catch (error) {
      console.log(error)
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error al crear el grupo',
        error: error.message
      })
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
