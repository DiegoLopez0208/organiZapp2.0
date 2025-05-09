import Joi from "joi";

export const taskParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/, "numbers")
    .required(),
});

export const taskSchema = Joi.object({
  userId: Joi.number().integer().min(1).required(),

  taskName: Joi.string().required().min(1).max(500),

  title: Joi.string().required().min(1).max(500),

  description: Joi.string().allow('').optional().max(1000), 

  date: Joi.date().timestamp('javascript'),

  startTime: Joi.date().timestamp().allow(null).optional(),

  endTime: Joi.date().timestamp().allow(null).optional(),

  status: Joi.string().required().min(1).max(30),
});

export const updateTaskSchema = Joi.object({
  taskName: Joi.string().required().min(1).max(500),
  title: Joi.string().required().min(1).max(500),
  description: Joi.string().allow('').optional().max(1000),
  date: Joi.date().timestamp('javascript'),
  startTime: Joi.date().timestamp().allow(null).optional(),
  endTime: Joi.date().timestamp().allow(null).optional(),
  status: Joi.string().required().min(1).max(30),
});