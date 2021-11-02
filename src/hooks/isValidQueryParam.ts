import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import Joi from 'joi';

export default (schemaValidate: Joi.Schema): Hook => {
  return (context: HookContext): HookContext => {
    const validationObj = schemaValidate.validate({ ...context.params.query });
    if (validationObj.error) {
      throw new BadRequest(`${validationObj.error.details[0].message}`);
    }
    return context;
  };
};
