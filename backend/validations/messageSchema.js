import Joi from 'joi'

export const messageParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/, 'numbers')
    .required()
    .min(0)
})

export const messageSchema = Joi.object({
  content: Joi.string().min(1).required(),
  senderId: Joi.number().integer().positive().required(),
  receiverId: Joi.number().integer().positive().optional(),
  groupId: Joi.number().integer().positive().optional(),
  sentAt: Joi.date().iso().required()
})
