// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';
import {paramsSchema} from '../services/users/users.validations';
import {BadRequest} from '@feathersjs/errors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const validationObj = paramsSchema.validate({...context.params.query});
    if ('error' in validationObj) {
      throw new BadRequest(`${validationObj.error}`);
    }
    return context;
  };
};
