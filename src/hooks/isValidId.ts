import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import Joi from 'joi';

/**
 * Check if id is valid UUID
 * schemaValidate - Joi object with validation rules
 * context.id - UUID to validate
 */
export default (schemaValidate: Joi.Schema): Hook => {
  return (context: HookContext): HookContext => {
    const validationObj = schemaValidate.validate({ id: context.id });
    if (validationObj.error) {
      throw new BadRequest(`${validationObj.error.details[0].message}`);
    }
    return context;
  };
};

