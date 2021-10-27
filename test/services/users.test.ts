import assert from 'assert';
import app from '../../src/app';

describe('\'users\' service', () => {
  // before
  // save service globally and use in each test
  // 
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });
});
