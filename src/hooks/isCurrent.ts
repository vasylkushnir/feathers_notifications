// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Forbidden } from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.params.user?.id !== context.id) {
      throw new Forbidden('access denied');
    }
    return context;
  };
};
