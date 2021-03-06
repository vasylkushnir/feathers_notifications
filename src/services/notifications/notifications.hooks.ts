import * as authentication from '@feathersjs/authentication';
import { setField } from 'feathers-authentication-hooks';
import validate from 'feathers-validate-joi';
import {
  createNotificationSchema,
  getNotificationFilters,
  notificationId,
  updateNotificationSchema,
} from './notifications.validations';
import isValidId from '../../hooks/isValidId';
import { iff, isProvider } from 'feathers-hooks-common';
import isValidQueryParam from '../../hooks/isValidQueryParam';
import isExistingUser from '../../hooks/isExistingUser';
import { HookContext } from '@feathersjs/feathers';
import checkPermissions from 'feathers-permissions';
import { UserRoles } from '../../models/users.model';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

/**
 * Add isRead = false query param to update only not read notifications
 * */
function setNotificationStatus(context: HookContext): HookContext {
  if (!context.id){
    context.params.query = {
      isRead: false,
      ...context.params.query,
    };
  }
  return context;
}
function sortByCreatedAt(context: HookContext): HookContext {
  if (!context.params.query?.$sort) {
    context.params.query = {
      $sort: { createdAt: -1 },
      ...context.params.query,
    };
  }
  return context;
}

export default {
  before: {

    all: [
      authenticate('jwt'),
      setField({
        from: 'params.user.id',
        as: 'params.query.userId',
      }),
    ],
    find: [
      iff(isProvider('external'), isValidQueryParam(getNotificationFilters)),
      sortByCreatedAt,
    ],
    get: [isValidId(notificationId)],
    create: [
      checkPermissions({
        roles: [ UserRoles.ADMIN, UserRoles.SUPER_ADMIN ],
      }),
      validate.form(createNotificationSchema),
      isExistingUser(),
    ],
    update: [isValidId(notificationId)],
    patch: [
      validate.form(updateNotificationSchema),
      isValidId(notificationId),
      setNotificationStatus,
    ],
    remove: [isValidId(notificationId)],
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
