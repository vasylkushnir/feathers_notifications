import app from '../../src/app';
import { expect } from 'chai';

const service = app.service('notifications');

describe('\'notifications\' service', () => {
  it('registered the service', () => {
    expect(service).to.exist;
  });
});
