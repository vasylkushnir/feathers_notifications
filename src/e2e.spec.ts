import app from './app';
import { expect } from 'chai';
import { Id } from '@feathersjs/feathers';
import { after, before, describe } from 'mocha';

describe('USERS', () => {
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
  
  describe('Create notification EEEE@EEEEEE', () => {
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

    it('should fail - user with USER role is not able to create notification', async () => {
      try {
        await app.service('notifications').create(notification, {
          provider: 'rest',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        expect.fail('call should have failed');
      } catch (err: any) {
       
      }
    });
  });
});
