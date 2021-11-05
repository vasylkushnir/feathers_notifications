import app from '../../app';
import { expect } from 'chai';

const service = app.service('notifications');
const userInfo = {
  firstName: 'test user name',
  lastName: 'test user last',
  email: 'create_notification@example.com',
  password: 'supersecret',
};
let userId!: number;
let notificationId: number;
const notExistedNotificationId = '66c9a620-3bdc-11ec-a993-ff3e9e1971e7';
const notificationInfo = {
  description: 'test description',
  userId,
  type: 'REPORT_CREATED',
};

describe('\'notifications\' service', () => {
  it('registered the service', () => {
    expect(service).to.exist;
  });
  describe('create notification', () => {
    before(async () => {
      const { id } = await app.service('users').create(userInfo);
      userId = id;
      notificationInfo.userId = id;
    });

    after(async () => {
      await service.remove(notificationId);
      await app.service('users').remove(userId);
    });

    it('should succeed - create notification', async () => {
      const notificationResponse = await service.create(notificationInfo);
      const { description, id } = notificationResponse;
      notificationId = id;
      expect(id).to.exist;
      expect(description).to.equal(notificationInfo.description);
      expect(notificationResponse).to.have.keys(['id', 'isRead', 'type', 'description', 'createdAt', 'updatedAt', 'userId']);
    });

    it('should fail - not existed userId', async () => {
      const notificationInvalidUserId = {
        description: 'test notification',
        userId: '783deee0-3732-11ec-9301-13adbda06b66',
      };
      try {
        await service.create(notificationInvalidUserId);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(400);
      }
    });

    it('should fail - invalid data', async () => {
      const notificationInvalidData = {
        description: 12,
        isRead: 'yes',
        type: 'READ_WRITE',
      };
      try {
        await service.create(notificationInvalidData);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(400);
      }
    });
  });

  describe('get notification by id', () => {
    before(async () => {
      const response = await app.service('users').create(userInfo);
      userId = response.id;
      notificationInfo.userId = response.id;
      const { id } = await service.create(notificationInfo);
      notificationId = id;
    });

    after(async () => {
      await service.remove(notificationId);
      await app.service('users').remove(notificationInfo.userId);
    });

    it('should succeed - get notification by id', async () => {
      const notificationResponse = await service.get(notificationId);
      const { description, type, id, userId } = notificationResponse;
      expect(description).to.equal(notificationInfo.description);
      expect(type).to.equal(notificationInfo.type);
      expect(userId).to.equal(userId);
      expect(id).to.equal(notificationId);
    });

    it('should fail - not existed notificationId', async () => {
      try {
        await service.get(notExistedNotificationId);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(404);
      }
    });

    it('should fail - invalid id', async () => {
      try {
        await service.get('7777');
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(400);
      }
    });
  });

  describe('find notification', () => {
    before(async () => {
      const response = await app.service('users').create(userInfo);
      userId = response.id;
      notificationInfo.userId = response.id;
      const { id } = await service.create(notificationInfo);
      notificationId = id;
    });

    after(async () => {
      await service.remove(notificationId);
      await app.service('users').remove(userId);
    });

    it('should succeed - get notification by id', async () => {
      const response: any = await service.find();
      const { total } = response;
      expect(total).not.to.equal(0);
      expect(response).to.have.keys(['total', 'limit', 'skip', 'data']);
    });
  });

  describe('update (patch) notification status', () => {
    before(async () => {
      const response = await app.service('users').create(userInfo);
      userId = response.id;
      notificationInfo.userId = response.id;
      const { id } = await service.create(notificationInfo);
      notificationId = id;
    });

    after(async () => {
      await service.remove(notificationId);
      await app.service('users').remove(userId);
    });

    it('should succeed - update notification status', async () => {
      const { isRead } = await service.patch(notificationId, { isRead: true });
      expect(isRead).to.equal(true);
    });

    it('should fail - not existed notificationId', async () => {
      try {
        await service.patch(notExistedNotificationId, { isRead: true });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(404);
      }
    });

    it('should fail - invalid body attribute', async () => {
      try {
        await service.patch(notificationId, { completed: true });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(400);
      }
    });

    it('should fail - invalid status value', async () => {
      try {
        await service.patch(notificationId, { isRead: false });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code } = err;
        expect(code).to.equal(400);
      }
    });
  });
});
