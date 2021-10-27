// add users validations
// validate if email is exist
// remove user - should be blocked! (hooks - disallow('extyernal)
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
    .required()
});




