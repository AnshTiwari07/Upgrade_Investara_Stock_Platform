import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from './api';

describe('API Service Retry Logic', () => {
  let mock;
  jest.setTimeout(30000); // Increase timeout for retry tests

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  test('should retry on 500 server error up to 3 times', async () => {
    // 1st attempt: 500, 2nd attempt: 500, 3rd attempt: 500, 4th attempt: 200
    mock.onGet('/test').replyOnce(500);
    mock.onGet('/test').replyOnce(500);
    mock.onGet('/test').replyOnce(500);
    mock.onGet('/test').replyOnce(200, { success: true });

    const res = await api.get('/test');
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(mock.history.get.length).toBe(4);
  });

  test('should fail after 3 unsuccessful retries', async () => {
    mock.onGet('/test').reply(500);

    await expect(api.get('/test')).rejects.toThrow();
    expect(mock.history.get.length).toBe(4); // 1 original + 3 retries
  });

  test('should not retry on 401 unauthorized error', async () => {
    mock.onGet('/test').reply(401, { msg: 'Unauthorized' });

    const promise = api.get('/test');

    await expect(promise).rejects.toThrow();
    expect(mock.history.get.length).toBe(1); // Should fail immediately
  });

  test('should not retry on 404 not found error', async () => {
    mock.onGet('/test').reply(404, { msg: 'Not Found' });

    const promise = api.get('/test');

    await expect(promise).rejects.toThrow();
    expect(mock.history.get.length).toBe(1); // Should fail immediately
  });

  test('should attach x-auth-token header if token exists in localStorage', async () => {
    const token = 'test-token';
    localStorage.setItem('token', token);
    mock.onGet('/test').reply(200);

    await api.get('/test');

    expect(mock.history.get[0].headers['x-auth-token']).toBe(token);
    localStorage.removeItem('token');
  });
});
