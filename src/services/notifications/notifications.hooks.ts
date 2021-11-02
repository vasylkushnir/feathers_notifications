import * as authentication from '@feathersjs/authentication';
import { setField } from 'feathers-authentication-hooks';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;


export default {
  before: {

    all: [
      authenticate('jwt'),
      setField({
        from: 'params.user.id',
        as: 'params.query.userId',
      }),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [ ],
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
