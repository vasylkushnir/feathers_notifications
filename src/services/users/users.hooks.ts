import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import validate from 'feathers-validate-joi';
import {createUserSchema} from './users.validations';
import isUniqueEmail from '../../hooks/isUniqueEmail';
import isCurrent from '../../hooks/isCurrent';
import { iff, isProvider } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

export default {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [
      authenticate('jwt'),
      iff(isProvider('external'), isCurrent())
    ],
    create: [
      validate.form(createUserSchema),
      isUniqueEmail(),
      hashPassword('password')
    ],
    update: [ 
      hashPassword('password'),  
      authenticate('jwt') 
    ],
    patch: [ 
      hashPassword('password'),  
      authenticate('jwt') 
    ],
    remove: [ authenticate('jwt') ]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
