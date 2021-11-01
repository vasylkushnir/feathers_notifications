// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import Joi from 'joi';

export default (schemaValidate: Joi.Schema): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const validationObj = schemaValidate.validate({ ...context.params.query });
    if ('error' in validationObj) {
      throw new BadRequest(`${validationObj.error}`);
    }
    return context;
  };
};
