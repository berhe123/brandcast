const { test } = require('node:test');
const assert = require('node:assert');
const { generateMockContent } = require('../src/services/mockAiService');

const brandInfo = { name: 'Aura', website: 'https://example.com' };

test('respects the Twitter character limit', () => {
  const out = generateMockContent({
    platform: 'twitter', topic: 'Launch our new app today', tone: 'exciting',
    contentType: 'post', language: 'english', includeHashtags: true, includeEmoji: true, brandInfo,
  });
  assert.ok(typeof out === 'string' && out.length > 0);
  assert.ok(out.length <= 280, `tweet should be <= 280 chars, got ${out.length}`);
});

test('blog content is long-form and titled', () => {
  const out = generateMockContent({
    platform: 'blog', topic: 'why simple wins', tone: 'professional',
    contentType: 'blog', language: 'english', includeHashtags: false, includeEmoji: false, brandInfo,
  });
  assert.ok(out.startsWith('# '), 'blog should start with a markdown title');
  assert.ok(out.includes('Aura'), 'blog should reference the brand');
  assert.ok(out.length > 280, 'blog should be long-form');
});

test('emoji can be disabled', () => {
  const out = generateMockContent({
    platform: 'facebook', topic: 'a friendly hello', tone: 'friendly',
    contentType: 'post', language: 'english', includeHashtags: false, includeEmoji: false, brandInfo,
  });
  const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(out);
  assert.strictEqual(hasEmoji, false, 'no emoji expected when disabled');
});

test('hashtags include a brand tag when enabled', () => {
  const out = generateMockContent({
    platform: 'instagram', topic: 'spring collection', tone: 'inspiring',
    contentType: 'post', language: 'english', includeHashtags: true, includeEmoji: true, brandInfo,
  });
  assert.ok(out.includes('#Aura'), 'expected a brand hashtag');
});
