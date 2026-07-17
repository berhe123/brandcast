const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { decidePostCount } = require('../src/services/monthlyPlanService');

describe('decidePostCount', () => {
  it('returns 8–15', () => {
    const n = decidePostCount('I own a coffee shop and I want more customers, create months content');
    assert.ok(n >= 8 && n <= 15);
  });

  it('leans higher for aggressive growth goals', () => {
    const n = decidePostCount('aggressive daily growth campaign to scale and get more customers');
    assert.ok(n >= 12);
  });

  it('leans lower for soft goals', () => {
    const n = decidePostCount('soft light maintain presence');
    assert.equal(n, 8);
  });
});
