import app from '../../app';
import { expect } from 'chai';
import { Id } from '@feathersjs/feathers';
import { after } from 'mocha';

describe('\'users\' service', () => {
  const service = app.service('users');
  const userInfo = {
    firstName: 'test user name',
    lastName: 'test user last',
    email: 'create@example.com',
    password: 'supersecret',
  };
  let userId: Id;
  const unexistedId = '783deee0-3732-11ec-9301-13adbda06b66';

  describe('create user', () => {
    before(() => {
      expect(service).to.exist;
    });

    after(async () => {
      await service.remove(userId);
    });

    it('should succeed - creates user', async () => {
      const response = await service.create(userInfo);
      const { id, email } = response;
      userId = id;
      expect(id).to.exist;
      expect(email).to.equal(userInfo.email);
      expect(response).to.have.keys(['id', 'firstName', 'lastName', 'email', 'createdAt', 'updatedAt', 'password', 'title', 'permissions']);
    });

    it('should fail - email already in use', async () => {
      try {
        await service.create(userInfo);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Email is already in use. Please log in');
      }
    });

    it('should fail - missed data', async () => {
      try {
        await service.create({
          lastName: 'test user last',
          email: 'create_user@example.com',
        });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Invalid data');
      }
    });

  });

  describe('get user', () => {
    before(async () => {
      const { id } = await service.create(userInfo);
      userId = id;
    });

    after(async () => {
      await service.remove(userId);
    });

    it('should succeed - get user by id', async () => {
      const { email, id } = await service.get(userId);
      expect(id).to.exist;
      expect(email).to.equal(userInfo.email);
    });

    it('should fail - not existed userId', async () => {
      try {
        await service.get(unexistedId);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(404);
      }
    });

    it('should fail - invalid userId', async () => {
      try {
        await service.get('123456');
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('"id" must be a valid GUID');
      }
    });
  });

  describe('find user', () => {
    before(async () => {
      const { id } = await service.create(userInfo);
      userId = id;
    });

    after(async () => {
      await service.remove(userId);
    });

    it('should succeed - find user', async () => {
      const response: any = await service.find();
      const { total } = response;
      expect(total).not.to.equal(0);
      expect(response).to.have.keys(['total', 'limit', 'skip', 'data']);
    });
  });

  describe('update (patch) user', () => {
    const existUser = {
      firstName: 'test user name',
      lastName: 'test user last',
      email: 'update@example.com',
      password: 'supersecret',
    };
    const updateUser = {
      firstName: 'updated first name',
      lastName: 'updated user last name',
    };
    const updateUserEmail = {
      email: 'updatedemail@test.com',
    };
    let _userId: Id;
    before(async () => {
      const { id } = await service.create(userInfo);
      userId = id;
    });

    before(async () => {
      const { id } = await service.create(existUser);
      _userId = id;
    });

    after(async () => {
      await service.remove(userId);
      await service.remove(_userId);
    });

    it('should succeed - update(patch) user', async () => {
      await service.patch(userId, updateUser);
      const { firstName, lastName } = await service.get(userId);
      expect(firstName).to.equal(updateUser.firstName);
      expect(lastName).to.equal(updateUser.lastName);
    });

    it('should succeed - update(patch) user email', async () => {
      await service.patch(userId, updateUserEmail);
      const { email } = await service.get(userId);
      expect(email).to.equal(updateUserEmail.email);
    });

    it('should fail - invalid user id', async () => {
      try {
        await service.patch(unexistedId,updateUser);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(404);
      }
    });

    it('should fail - invalid user data', async () => {
      const invalidUserData = {
        firstName: 12,
        lastName: 'updated user last name',
        email: 123456,
        password: 'supersecret',
      };
      try {
        await service.patch(userId,invalidUserData);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Invalid data');
      }
    });

    it('should fail - email already in use', async () => {
      try {
        await service.patch(userId, { email: 'update@example.com' });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Validation error');
      }
    });
  });

  describe('update (put) user', () => {
    const updatePutUser = {
      firstName: 'updated user name',
      lastName: 'updated user last',
      email: 'create@example.com',
      password: 'supersecret',
      permissions: ['USER'],
    };
    before(async () => {
      const { id } = await service.create(userInfo);
      userId = id;
    });

    after(async () => {
      await service.remove(userId);
    });

    it('should succeed - update(put) user', async () => {
      const { firstName, lastName } = await service.update(userId, updatePutUser);
      expect(firstName).to.equal(updatePutUser.firstName);
      expect(lastName).to.equal(updatePutUser.lastName);
    });

    it('should fail - invalid user id', async () => {
      try {
        await service.update(unexistedId,updatePutUser);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(404);
      }
    });

    it('should fail - invalid data', async () => {
      const invalidUserData = {
        firstName: 12,
        lastName: 'updated user last name',
        email: 123456,
        password: 'supersecret',
      };
      try {
        await service.update(userId,invalidUserData);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Invalid data');
      }
    });
  });

  describe('delete user', () => {

    it('should fail - invalid id', async () => {
      try {
        await service.remove('123456', { provider: 'rest' });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(405);
        expect(message).to.equal('Provider \'rest\' can not call \'remove\'. (disallow)');
      }
    });
  });
});
