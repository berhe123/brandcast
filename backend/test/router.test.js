const { test } = require('node:test');
const assert = require('node:assert');
const { route, selectSingle, selectHybrid, rankModels } = require('../src/ai/router');
const { MODELS } = require('../src/ai/catalog');

test('rankModels returns every model, best first', () => {
  const { ranked } = rankModels({ platform: 'instagram', contentType: 'post', language: 'english' });
  assert.strictEqual(ranked.length, MODELS.length);
  for (let i = 1; i < ranked.length; i++) {
    assert.ok(ranked[i - 1].score >= ranked[i].score, 'scores must be descending');
  }
});

test('selectSingle picks one valid model with a rationale', () => {
  const d = selectSingle({ platform: 'twitter', contentType: 'post', language: 'english' });
  assert.strictEqual(d.mode, 'single');
  assert.ok(MODELS.some((m) => m.id === d.primary.id));
  assert.ok(typeof d.rationale === 'string' && d.rationale.length > 0);
});

test('selectHybrid returns a complementary pair + synthesizer', () => {
  const d = selectHybrid({ platform: 'linkedin', contentType: 'blog', language: 'english' });
  assert.strictEqual(d.mode, 'hybrid');
  assert.ok(d.primary && d.partner && d.synthesizer);
  assert.notStrictEqual(d.primary.id, d.partner.id, 'pair must be two different models');
  assert.ok(d.synthesizer.id === d.primary.id || d.synthesizer.id === d.partner.id);
});

test('auto mode escalates high-stakes (blog) tasks to hybrid', () => {
  const d = route({ platform: 'facebook', contentType: 'blog', language: 'english' }, 'auto');
  assert.strictEqual(d.mode, 'hybrid');
});

test('language gating favours a model that speaks the target language', () => {
  const { ranked } = rankModels({ platform: 'facebook', contentType: 'post', language: 'japanese' });
  // Gemini supports japanese; the winner must be a model that lists it.
  const winner = MODELS.find((m) => m.id === ranked[0].model.id);
  assert.ok(winner.languages.includes('japanese'), 'top model should speak japanese');
});
