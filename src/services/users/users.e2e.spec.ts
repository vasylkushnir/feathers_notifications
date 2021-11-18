import app from '../../app';
import { expect } from 'chai';
import { Id } from '@feathersjs/feathers';
import { after, before, describe } from 'mocha';
import axios from 'axios';
import { Server } from 'http';

const port = app.get('port');
axios.defaults.baseURL = `http://localhost:${port}`;

describe('USERS e2e', () => {
  const service = app.service('users');
  const userInfo = {
    firstName: 'test user name',
    lastName: 'test user last',
    email: 'e2e@example.com',
    password: 'supersecret',
  };
  const userLogin = {
    email: 'e2e@example.com',
    password: 'supersecret',
  };
  let userId!: Id;
  let token: any;
  let server: Server;

  before(function(done) {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  after(function(done) {
    server.close(done);
  });

  describe('Users - role USER', () => {
    before( async () => {
      const { id } = await service.create(userInfo);
      userId = id;
      const { accessToken } = await app.service('authentication').create(userLogin, {});
      token = accessToken;
    });
    after(async () => {
      await app.service('users').remove(userId);
    });

    it('should fail - user is unable to delete user', async () => {
      try {
        await axios.delete(`/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { response: { data } } = err;
        expect(data.code).to.equal(405);
        expect(data.message).to.equal('Provider \'rest\' can not call \'remove\'. (disallow)');
      }
    });

    it('should fail - user is unable to update another user', async () => {
      const userUpdate = {
        firstName: 'updated user name',
        lastName: 'updated user13 last',
        email: 'qa38@test.com',
        password: 'supersecret',
      };
      try {
        await axios.put('/users/6e8cc4f4-693c-4294-9bd7-b17bd8e777b9',userUpdate, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { response: { data } } = err;
        expect(data.code).to.equal(403);
        expect(data.message).to.equal('access denied');
      }
    });

    it('should fail - user is unable to get all users', async () => {
      try {
        await axios.get('/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { response: { data } } = err;
        expect(data.code).to.equal(403);
        expect(data.message).to.equal('You do not have the correct permissions.');
      }
    });

  });
  describe('User - role Admin', () => {
    before( async () => {
      const { id } = await service.create(userInfo);
      userId = id;
      await app.service('users').Model.update(
        { permissions: ['ADMIN'] },
        { where: { id: userId } });
      const { accessToken } = await app.service('authentication').create(userLogin, {});
      token = accessToken;
    });
    after(async () => {
      await app.service('users').remove(userId);
    });

    it('should success - user is able to get all users', async () => {
      const response: any = await axios.get('/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const { data }  = response;
      expect(data.total).not.to.equal(0);
      expect(data).to.have.keys(['total', 'limit', 'skip', 'data']);
    });
  });
});
