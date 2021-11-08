import app from '../../app';
import { expect } from 'chai';
import { Id } from '@feathersjs/feathers';

describe('\'notifications\' service', () => {
  const service = app.service('notifications');
  const userInfo = {
    firstName: 'test user name',
    lastName: 'test user last',
    email: 'create_notification@example.com',
    password: 'supersecret',
  };
  let userId!: Id;
  let notificationId1: Id;
  let notificationId2: Id;
  const notExistedNotificationId = '66c9a620-3bdc-11ec-a993-ff3e9e1971e7';
  const notificationInfo = {
    description: 'test description',
    userId,
    type: 'REPORT_CREATED',
  };
  const notificationCreated = {
    description: 'test description',
    userId,
    type: 'TERMS_UPDATED',
  };

  before(async () => {
    expect(service).to.exist;
    const { id } = await app.service('users').create(userInfo);
    userId = id;
    notificationInfo.userId = id;
    notificationCreated.userId = id;
  });

  after(async () => {
    await app.service('users').remove(userId);
  });

  describe('create notification', () => {
    after(async () => {
      await service.remove(notificationId1);
    });

    it('should succeed - create notification', async () => {
      const response = await service.create(notificationInfo);
      notificationId1 = response.id;
      expect(response.id).to.exist;
      expect(response.description).to.equal(notificationInfo.description);
      expect(response.isRead).to.equal(false);
      expect(response.type).to.equal(notificationInfo.type);
      expect(response).to.have.keys(['id', 'isRead', 'type', 'description', 'createdAt', 'updatedAt', 'userId']);
    });

    it('should fail - not existed userId', async () => {
      try {
        await service.create({
          description: 'test notification',
          userId: '783deee0-3732-11ec-9301-13adbda06b66',
          type: 'TERMS_UPDATED',
        });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(404);
        expect(message).to.equal('No record found for id \'783deee0-3732-11ec-9301-13adbda06b66\'');
      }
    });

    it('should fail - invalid data', async () => {
      try {
        await service.create({
          description: 12,
          isRead: 'yes',
          type: 'READ_WRITE',
        });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Invalid data');
      }
    });
  });

  describe('get notification by id', () => {
    before(async () => {
      const { id } = await service.create(notificationInfo);
      notificationId1 = id;
    });

    after(async () => {
      await service.remove(notificationId1);
    });

    it('should succeed - get notification by id', async () => {
      const { description, type, id, userId } = await service.get(notificationId1);
      expect(description).to.equal(notificationInfo.description);
      expect(type).to.equal(notificationInfo.type);
      expect(userId).to.equal(userId);
      expect(id).to.equal(notificationId1);
    });

    it('should fail - not existed notificationId', async () => {
      try {
        await service.get(notExistedNotificationId);
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(404);
        expect(message).to.equal(`No record found for id '${notExistedNotificationId}'`);
      }
    });

    it('should fail - invalid id', async () => {
      try {
        await service.get('7777');
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('\"id\" must be a valid GUID');
      }
    });
  });

  describe('find notification', () => {
    before(async () => {
      const { id } = await service.create(notificationInfo);
      notificationId1 = id;
      const { id: notifId } = await service.create(notificationCreated);
      notificationId2 = notifId;
    });

    after(async () => {
      await service.remove(notificationId1);
      await service.remove(notificationId2);
    });

    it('should succeed - find just created notification', async () => {
      const response: any = await service.find();
      expect(response.total).to.equal(2);
      expect(response).to.have.keys(['total', 'limit', 'skip', 'data']);
    });

    it('should succeed - check pagination', async () => {
      const response: any = await service.find({ query: {
        $skip: 5,
      },
      });
      const { data, skip } = response;
      expect(data).to.have.lengthOf(0);
      expect(skip).to.equal(5);
      expect(response).to.have.keys(['total', 'limit', 'skip', 'data']);
    });

    it('should succeed - check sorting', async () => {
      const response: any = await service.find();
      expect(response.data[0].id).to.equal(notificationId2);
      expect(response.data[1].id).to.equal(notificationId1);
    });
  });

  describe('update (patch) notification status', () => {
    before(async () => {
      const { id } = await service.create(notificationInfo);
      notificationId1 = id;
      const { id: notifId } = await service.create(notificationInfo);
      notificationId2 = notifId;
    });

    after(async () => {
      await service.remove(notificationId1);
      await service.remove(notificationId2);
    });

    it('should succeed - update notification status', async () => {
      const { isRead } = await service.patch(notificationId1, { isRead: true });
      expect(isRead).to.equal(true);
    });

    it('should succeed - update status for all notifications', async () => {
      const response = await service.patch(null,{ isRead: true });
      const { isRead } = response[0];
      expect(isRead).to.equal(true);
    });

    it('should fail - not existed notificationId', async () => {
      try {
        await service.patch(notExistedNotificationId, { isRead: true });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(404);
        expect(message).to.equal(`No record found for id '${notExistedNotificationId}'`);
      }
    });

    it('should fail - invalid body attribute', async () => {
      try {
        await service.patch(notificationId1, { completed: true });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Invalid data');
      }
    });

    it('should fail - invalid status value', async () => {
      try {
        await service.patch(notificationId1, { isRead: false });
        expect.fail('call should have failed');
      } catch (err: any) {
        const { code, message } = err;
        expect(code).to.equal(400);
        expect(message).to.equal('Invalid data');
      }
    });
  });
});
