import validate from 'feathers-validate-joi';
import {loginUserSchema} from './authentication.validations';
import addStrategy from '../../hooks/addStrategy';
// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {

    all: [
      addStrategy(),
      validate.form(loginUserSchema)
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
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
