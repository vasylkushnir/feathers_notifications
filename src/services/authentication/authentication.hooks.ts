import validate from 'feathers-validate-joi';
import { loginUserSchema } from './authentication.validations';
import { HookContext } from '@feathersjs/feathers';
import { iff } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

function addStrategy (context: HookContext): HookContext {
  context.data = {
    strategy: context.data.strategy || 'local',
    ...context.data,
  };
  return context;
}

export default {
  before: {

    all: [
      addStrategy,
      iff(context => context.data.strategy === 'local', validate.form(loginUserSchema)),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
