import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';

/**
 * Check if user exist in database (by user id)
 * data.userId - user id from request body
 * user - query result
 */
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, data } = context;
    const user = await app.service('users').get(data.userId);
    if (!user) {
      throw new BadRequest(`User with id ${data.userId} is not exist`);
    }
    return context;
  };
};
