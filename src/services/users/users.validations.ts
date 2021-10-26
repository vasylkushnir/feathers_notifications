// add users validations
// validate if email is exist
// remove user - should be blocked! (hooks - disallow('extyernal)
import Joi from 'joi';


const createUserSchema = Joi.object().keys({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  password: Joi.string().required()
});

export default createUserSchema



