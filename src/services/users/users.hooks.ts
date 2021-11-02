import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import validate from 'feathers-validate-joi';
import { createUserSchema, getUsersFilters, replaceUserSchema, updateUserSchema } from './users.validations';
import isUniqueEmail from '../../hooks/isUniqueEmail';
import isCurrent from '../../hooks/isCurrent';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
import isValidId from '../../hooks/isValidId';
import isValidQueryParam from '../../hooks/isValidQueryParam';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

export default {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      iff(isProvider('external'), isValidQueryParam(getUsersFilters)),
    ],
    get: [
      authenticate('jwt'),
      isValidId(),
      iff(isProvider('external'), isCurrent()),
    ],
    create: [
      validate.form(createUserSchema),
      isUniqueEmail(),
      hashPassword('password'),
    ],
    update: [
      authenticate('jwt'),
      isValidId(),
      validate.form(replaceUserSchema),
      iff(isProvider('external'), isCurrent(), isUniqueEmail()),
      hashPassword('password'),
    ],
    patch: [
      authenticate('jwt'),
      isValidId(),
      validate.form(updateUserSchema),
      iff(isProvider('external'), isCurrent(), isUniqueEmail()),
      hashPassword('password'),
    ],
    remove: [
      disallow('external'),
    ],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password'),
    ],
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
