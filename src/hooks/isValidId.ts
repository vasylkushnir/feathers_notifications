import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import { userId } from '../services/users/users.validations';

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const validationObj = userId.validate({ id: context.id });
    if ('error' in validationObj) {
      throw new BadRequest(`${validationObj.error}`);
    }
    return context;
  };
};
