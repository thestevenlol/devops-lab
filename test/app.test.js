const { test } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');

test('GET / returns the hello message', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(res.text, /Hello from Docker/);
});

test('GET /health reports ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.uptime, 'number');
});

test('greets a valid name', async () => {
  const res = await request(app).get('/api/greet/Jack');
  assert.equal(res.status, 200);
  assert.equal(res.body.greeting, 'Hello, Jack!');
});

test('rejects an over-long name', async () => {
  const res = await request(app).get('/api/greet/' + 'a'.repeat(51));
  assert.equal(res.status, 400);
});

test('POST /api/sum adds numbers', async () => {
  const res = await request(app).post('/api/sum').send({ numbers: [1, 2, 3, 4] });
  assert.equal(res.status, 200);
  assert.equal(res.body.total, 10);
});

test('POST /api/sum rejects non-numeric input', async () => {
  const res = await request(app).post('/api/sum').send({ numbers: [1, 'two', 3] });
  assert.equal(res.status, 400);
});

test('unknown route returns 404', async () => {
  const res = await request(app).get('/does-not-exist');
  assert.equal(res.status, 404);
});