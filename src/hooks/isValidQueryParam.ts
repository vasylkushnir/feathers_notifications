import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import Joi from 'joi';

/**
 * Check if query params is valid against Joi schema
 * schemaValidate - Joi object with validation rules
 * ...context.params.query - query params to validate
 */
export default (schemaValidate: Joi.Schema): Hook => {
  return (context: HookContext): HookContext => {
    const validationObj = schemaValidate.validate({ ...context.params.query });
    if (validationObj.error) {
      throw new BadRequest(`${validationObj.error.details[0].message}`);
    }
    return context;
  };
};
