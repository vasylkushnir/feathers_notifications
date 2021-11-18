import app from '../../app';
import { expect } from 'chai';
import { Id } from '@feathersjs/feathers';
import { after, before, describe } from 'mocha';
import axios from 'axios';
import { Server } from 'http';

const port = app.get('port');
axios.defaults.baseURL = `http://localhost:${port}`;

describe('Notifications e2e', () => {
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
  const notification = {
    description: 'test notification...',
    userId,
    type: 'REPORT_CREATED',
  };
  let server: Server;

  before(function(done) {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  after(function(done) {
    server.close(done);
  });

  describe('User role - USER ', () => {
    before( async () => {
      const { id } = await service.create(userInfo);
      userId = id;
      notification.userId = id;
      const { accessToken } = await app.service('authentication').create(userLogin, {});
      token = accessToken;
    });
    after(async () => {
      await app.service('users').remove(userId);
    });

    it('should fail - user is not able to create notification', async () => {
      try {
        await axios.post('/notifications', notification, {
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

    it('should fail - unauthorized user is not able to create notification', async () => {
      try {
        await axios.post('/notifications', notification, {
          headers: {
            'Authorization': '123456',
          },
        });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { response: { data } } = err;
        expect(data.code).to.equal(401);
      }
    });
  });

  describe('User - role ADMIN', () => {
    before( async () => {
      const { id } = await service.create(userInfo);
      userId = id;
      notification.userId = id;
      await app.service('users').Model.update(
        { permissions: ['ADMIN'] },
        { where: { id: userId } });
      const { accessToken } = await app.service('authentication').create(userLogin, {});
      token = accessToken;
    });
    after(async () => {
      await app.service('users').remove(userId);
    });

    it('should success - user successfully creates notification', async () => {
      const response: any = await axios.post('/notifications', notification, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const { data } = response;
      expect(response.status).to.equal(201);
      expect(data.isRead).to.equal(false);
      expect(data.userId).to.equal(userId);
      expect(data.description).to.equal(notification.description);
    });
  });
});
