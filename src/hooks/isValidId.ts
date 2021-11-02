import { Hook, HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import { userId } from '../services/users/users.validations';

export default (): Hook => {
  return (context: HookContext): HookContext => {
    const validationObj = userId.validate({ id: context.id });
    if (validationObj.error) {
      throw new BadRequest(`${validationObj.error.details[0].message}`);
    }
    return context;
  };
};

