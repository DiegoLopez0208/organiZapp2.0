import Joi from "joi";
export const taskParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/, "numbers")
    .required()
    .min(0),
});

export const taskSchema = Joi.object({
  task_user_id: Joi.string()
    .pattern(/^[0-9]+$/, "numbers")
    .required()
    .min(0)
    .max(1000),

  task_name: Joi.string().required().min(10).max(500),

  title: Joi.string().required().min(20).max(500),

  date: Joi.date().timestamp().required(),

  status: Joi.string().required().min(20).max(30),
});
