import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import validate from 'feathers-validate-joi';
import { createUserSchema, updateUserSchema } from './users.validations';
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
      iff(isProvider('external'),isValidQueryParam()),
      authenticate('jwt')
    ],
    get: [
      authenticate('jwt'),
      isValidId(),
      iff(isProvider('external'), isCurrent())
    ],
    create: [
      validate.form(createUserSchema),
      isUniqueEmail(),
      hashPassword('password')
    ],
    update: [
      hashPassword('password'),
      authenticate('jwt'),
      iff(isProvider('external'),isValidId()),
      iff(isProvider('external'), isCurrent()),
      validate.form(updateUserSchema),
      iff(isProvider('external'), isUniqueEmail())
    ],
    patch: [
      hashPassword('password'),
      authenticate('jwt'),
      iff(isProvider('external'),isValidId()),
      iff(isProvider('external'), isCurrent()),
      validate.form(updateUserSchema),
      iff(isProvider('external'), isUniqueEmail())
    ],
    remove: [
      disallow('external'),
      isValidId(),
      authenticate('jwt')
    ]
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
