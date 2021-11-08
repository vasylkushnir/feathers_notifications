import app from '../../app';
import { after } from 'mocha';
import { Id } from '@feathersjs/feathers';
import { expect } from 'chai';

describe('authentication', () => {
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
  let userId: Id;

  describe('local strategy', () => {
    before(async () => {
      expect(service).to.exist;
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
