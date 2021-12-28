import { Forbidden } from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import { UserRoles } from '../models/users.model';

/**
 * Compares user id's - logged user and user id, set in params
 * context.id - user id taken from token
 * context.params.user?.id - user id taken from params
 */
export default (): Hook => {
  return (context: HookContext): HookContext => {
    const user = context.params.user?.permissions;
    if (!user.includes(UserRoles.ADMIN) && context.params.user?.id !== context.id) {
      throw new Forbidden('access denied');
    }
    return context;
  };
};
