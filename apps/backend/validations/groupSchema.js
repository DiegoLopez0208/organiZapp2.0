import Joi from "joi";
export const groupParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/, "numbers")
    .required()
    .min(0),
});

export const groupSchema = Joi.object({
  name: Joi.string().min(1).required(),
  createdAt: Joi.date().iso().required(),
  updatedAt: Joi.date().iso().optional(),
  deletedAt: Joi.date().iso().optional(),
});
