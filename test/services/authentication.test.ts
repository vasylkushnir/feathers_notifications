import app from '../../src/app';
import { after } from 'mocha';
import { NullableId } from '@feathersjs/feathers';
import { expect } from 'chai';

const service = app.service('authentication');
const userInfo = {
  firstName: 'test user name',
  lastName: 'test user last',
  email: 'someone_test@example.com',
  password: 'supersecret',
};
const userLogin = {
  email: 'someone_test@example.com',
  password: 'supersecret',
};
const notExistedUser = {
  email: 'notexisteduser@example.com',
  password: 'supersecret',
};
let userId: NullableId;

describe('authentication', () => {
  it('should succeed - registered the authentication service', () => {
    expect(service).to.exist;
  });

  describe('local strategy', () => {
    before(async () => {
      const { id } = await app.service('users').create(userInfo);
      userId = id;
    });
    
    after(async () => {
      await app.service('users').remove(userId);
    });

    it('should succeed - authenticates user and creates accessToken', async () => {
      const { user, accessToken } = await service.create({
        ...userLogin,
      }, {});
      expect(user.id).to.be.equal(userId);
      expect(accessToken).to.exist;
    });

    it('should fail - unexisted email', async () => {
      try {
        await service.create({
          ...notExistedUser,
        }, {});
        expect.fail('call should have failed');
      } catch (err: any) {
        expect(err.code).to.equal(401);
      }
    });
  });
});
