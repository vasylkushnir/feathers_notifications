import { Forbidden } from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.params.user?.id !== context.id) {
      throw new Forbidden('access denied');
    }
    return context;
  };
};
