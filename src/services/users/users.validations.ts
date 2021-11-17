import Joi from 'joi';
import { UserRoles } from '../../models/users.model';
const firstNameSchema = Joi.string().trim().min(1).max(100);
const lastNameSchema = Joi.string().trim().min(1).max(100);
const emailSchema = Joi.string().trim().email();
const passwordSchema = Joi.string();
const titleSchema = Joi.string().trim().min(1).max(100);
const permissions = Joi.array().items(Joi.string().valid(...Object.values(UserRoles)));

export const createUserSchema = Joi.object({
  firstName: firstNameSchema.required(),
  lastName: lastNameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
  title: titleSchema,
});

export const updateUserSchema = Joi.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  title: titleSchema,
  permissions,
});

export const replaceUserSchema = createUserSchema.keys({
  permissions,
});

export const userId = Joi.object({
  id: Joi.string().uuid().required(),
});

export const getUsersFilters = Joi.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  title: titleSchema,
});



