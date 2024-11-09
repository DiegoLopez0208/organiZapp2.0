import { taskSchema, taskParamsSchema } from '../validations/taskSchema.js'
import { userSchema, userParamsSchema } from '../validations/userSchema.js'

// Task Validations
export const taskValidation = (req, _res, next) => {
  const data = req.body
  const { error } = taskSchema.validate(data)
  if (error) {
    next(error)
  }
  next()
}
export const taskParamsValidation = (req, _res, next) => {
  const { id } = req.params
  const { error } = taskParamsSchema.validate(id)
  if (error) {
    next(error)
  }
  next()
}
// User Validation
export const userValidation = (req, _res, next) => {
  const data = req.body
  const { error } = userSchema.validate(data)
  if (error) {
    next(error)
  }
  next()
}
export const userParamsValidation = (req, _res, next) => {
  const { id } = req.params
  const { error } = userParamsSchema.validate(id)
  if (error) {
    next(error)
  }
  next()
}
