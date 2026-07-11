const { test } = require('node:test');
const assert = require('node:assert');
const { sign, verify } = require('../src/utils/jwt');

test('sign + verify round-trips the payload', () => {
  const token = sign({ sub: 'user-123', role: 'admin' });
  const payload = verify(token);
  assert.strictEqual(payload.sub, 'user-123');
  assert.strictEqual(payload.role, 'admin');
  assert.ok(payload.iat && payload.exp && payload.exp > payload.iat);
});

test('verify rejects a tampered token', () => {
  const token = sign({ sub: 'user-123' });
  const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'bb' : 'aa');
  assert.strictEqual(verify(tampered), null);
});

test('verify rejects malformed input', () => {
  assert.strictEqual(verify('not-a-token'), null);
  assert.strictEqual(verify(''), null);
  assert.strictEqual(verify(null), null);
});

test('verify rejects an expired token', () => {
  const token = sign({ sub: 'u' }, { expiresInSec: -10 });
  assert.strictEqual(verify(token), null);
});
