import Joi from "joi";
export const userParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/, "numbers")
    .required()
    .min(0),
});

export const userSchema = Joi.object({
  username: Joi.string().min(3).required(),
  name: Joi.string().min(3),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  birthDate: Joi.date().iso().min("1900-01-01").max("2013-12-31").required(),
});
