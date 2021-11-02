import Joi from 'joi';

export const loginUserSchema = Joi.object({
  strategy: Joi
    .string()
    .required(),
  email: Joi
    .string()
    .trim()
    .email()
    .required(),
  password: Joi
    .string()
    .required(),
});
