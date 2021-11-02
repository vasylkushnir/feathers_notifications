import Joi from 'joi';
const firstNameSchema = Joi.string().trim().min(1).max(100);
const lastNameSchema = Joi.string().trim().min(1).max(100);
const emailSchema = Joi.string().trim().email();
const passwordSchema = Joi.string();
const titleSchema = Joi.string().trim().min(1).max(100);

export const createUserSchema = Joi.object({
  firstName: firstNameSchema.required(),
  lastName: lastNameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
  title: titleSchema
});

export const updateUserSchema = Joi.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  title: titleSchema,
});

export const replaceUserSchema = Joi.object({
  firstName: firstNameSchema.required(),
  lastName: lastNameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
  title: titleSchema,
});

export const userId = Joi.object({
  id: Joi.string().uuid().required()
});

export const getUsersFilters = Joi.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  title: titleSchema,
});



