import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, data } = context;
    if (data.email){
      const user = await app.service('users').find({ query: { email: data.email } });
      if(user.total > 0) {
        throw new BadRequest('Email is already in use. Please log in');
      }
    }
    return context;
  };
};
