import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';

/**
 * Check if email is already exist in database
 * data.email - email from request body
 * user.total - if user with this email is exist,value in total will be greater than 0 
 */
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, data } = context;
    if (data.email){
      const user = await app.service('users').find({ query: { email: data.email } });
      if (user.total > 0) {
        throw new BadRequest('Email is already in use. Please log in');
      }
    }
    return context;
  };
};
