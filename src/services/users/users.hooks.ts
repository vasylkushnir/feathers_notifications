import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import validate from 'feathers-validate-joi';
import { createUserSchema, getUsersFilters, replaceUserSchema, updateUserSchema, userId } from './users.validations';
import isUniqueEmail from '../../hooks/isUniqueEmail';
import isCurrent from '../../hooks/isCurrent';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
import isValidId from '../../hooks/isValidId';
import isValidQueryParam from '../../hooks/isValidQueryParam';
import checkPermissions from 'feathers-permissions';
import { UserRoles } from '../../models/users.model';
import { HookContext } from '@feathersjs/feathers';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

function setUserRole(context: HookContext): HookContext {
  const permissions = context.params.user?.permissions;
  if (!permissions.includes(UserRoles.ADMIN)) {
    context.data = {
      ...context.data,
      permissions: [UserRoles.USER],
    };
  }
  return context;
}

export default {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      checkPermissions({
        roles: [ UserRoles.ADMIN ],
      }),
      iff(isProvider('external'), isValidQueryParam(getUsersFilters)),
    ],
    get: [
      authenticate('jwt'),
      isValidId(userId),
      iff(isProvider('external'), isCurrent()),
    ],
    create: [
      validate.form(createUserSchema),
      isUniqueEmail(),
      hashPassword('password'),
    ],
    update: [
      authenticate('jwt'),
      isValidId(userId),
      iff(isProvider('external'), setUserRole),
      validate.form(replaceUserSchema),
      iff(isProvider('external'), isCurrent(), isUniqueEmail()),
      hashPassword('password'),
    ],
    patch: [
      authenticate('jwt'),
      isValidId(userId),
      iff(isProvider('external'), setUserRole),
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
      iff(context => !context.params.user?.permissions.includes(UserRoles.ADMIN), protect('permissions')),
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
