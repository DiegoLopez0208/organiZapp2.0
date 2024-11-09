import Joi from 'joi'
export const userParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/, 'numbers')
    .required()
    .min(0)
})

export const userSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .required,

  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),

  birth_date: Joi.number()
    .integer()
    .min(1900)
    .max(2013)

})
