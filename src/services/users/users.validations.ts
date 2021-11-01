import Joi from 'joi';

export const createUserSchema = Joi.object({
  firstName: Joi
    .string()
    .trim()
    .min(1)
    .max(100)
    .required(),
  lastName: Joi
    .string()
    .trim()
    .min(1)
    .max(100)
    .required(),
  email: Joi
    .string()
    .trim()
    .email()
    .required(),
  password: Joi
    .string()
    .required(),
  title: Joi
    .string()
    .trim()
    .min(1)
    .max(100),
});

export const updateUserSchema = Joi.object({
  firstName: Joi
    .string()
    .trim()
    .min(1)
    .max(100),
  lastName: Joi
    .string()
    .trim()
    .min(1)
    .max(100),
  email: Joi
    .string()
    .trim()
    .email(),
  password: Joi
    .string(),
  title: Joi
    .string()
    .trim()
    .min(1)
    .max(100),
});

export const userId = Joi.object({
  id: Joi.string().uuid().required()
});

export const paramsSchema = Joi.object({
  firstName: Joi
    .string()
    .trim()
    .min(1)
    .max(100),
  lastName: Joi
    .string()
    .trim()
    .min(1)
    .max(100),
  email: Joi
    .string()
    .trim()
    .email(),
  title: Joi
    .string()
    .trim()
    .min(1)
    .max(100),
});



