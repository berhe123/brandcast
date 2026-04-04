const Anthropic = require('@anthropic-ai/sdk');
const { generateMockContent } = require('./mockAiService');

const isRealApiKey = () => {
  const key = process.env.ANTHROPIC_API_KEY;
  return key && key.trim().length > 10 && !key.includes('your_anthropic_api_key_here');
};

const platformConfig = {
  facebook: {
    maxLength: 500,
    style: 'engaging, community-focused, and conversational',
    features: 'can include longer text, call-to-action, and 2-3 relevant hashtags',
    emojiStyle: 'moderate, warm emoji use'
  },
  instagram: {
    maxLength: 300,
    style: 'visually descriptive, trendy, lifestyle-oriented, and aspirational',
    features: 'strong hook in first line, line breaks for readability, 10-15 relevant hashtags at the very end',
    emojiStyle: 'generous, expressive emoji use'
  },
  twitter: {
    maxLength: 280,
    style: 'concise, punchy, conversational, and trending',
    features: 'strictly under 280 characters, 1-2 hashtags woven naturally into text',
    emojiStyle: 'minimal but impactful emoji'
  },
  linkedin: {
    maxLength: 600,
    style: 'professional, insightful, and business-oriented',
    features: 'strong opening hook, structured paragraphs, 3-5 relevant hashtags at end, optionally a call-to-action',
    emojiStyle: 'minimal and professional emoji'
  },
  tiktok: {
    maxLength: 300,
    style: 'energetic, trendy, short, and attention-grabbing',
    features: 'hook in first line, concise caption, 3-5 trending hashtags, fun emojis',
    emojiStyle: 'expressive and on-trend emoji'
  }
};

const generateWithClaude = async (params) => {
  const { platform, topic, tone, contentType, targetAudience, language, includeHashtags, includeEmoji, customInstructions, brandInfo } = params;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const config = platformConfig[platform.toLowerCase()] || platformConfig.facebook;
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  const prompt = `You are an expert social media content creator for mySWOOOP, a leading German refurbished electronics marketplace.

BRAND CONTEXT:
- Company: ${brandInfo.name}
- Description: ${brandInfo.description}
- Voice: ${brandInfo.voice}
- Values: ${brandInfo.values.join(', ')}
- Tagline: "${brandInfo.tagline}"
- Products: Smartphones, Tablets, Laptops, MacBooks, Smartwatches, Cameras, Consoles
- Key Benefits: Up to 36 months warranty, 30-day returns, 97% customer satisfaction, 1M+ happy customers, 454 locations in Germany

TASK: Create a ${contentType} for ${platformName} about: "${topic}"

PLATFORM REQUIREMENTS (${platformName}):
- Style: ${config.style}
- Max length: ${config.maxLength} characters
- Features: ${config.features}
- Emoji usage: ${includeEmoji ? config.emojiStyle : 'no emojis'}

CONTENT SETTINGS:
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Language: ${language}
- Include Hashtags: ${includeHashtags ? 'Yes' : 'No'}
- Include Emojis: ${includeEmoji ? 'Yes' : 'No'}
${customInstructions ? `\nSPECIAL INSTRUCTIONS: ${customInstructions}` : ''}

RULES:
1. Output ONLY the ready-to-post content - no labels, explanations, or metadata
2. Strictly respect the character limit for ${platformName}
3. Make it authentic and engaging for the target audience
4. Align content with mySWOOOP sustainable mission
5. ${language === 'german' ? 'Write ENTIRELY in German (Deutsch)' : 'Write in English'}

Generate the post content now:`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
};

const generateSocialContent = async (params) => {
  if (!isRealApiKey()) {
    console.log('[AI Service] No API key set - using built-in demo generator');
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    return generateMockContent(params);
  }

  try {
    return await generateWithClaude(params);
  } catch (err) {
    const msg = err.message || '';
    if (err.status === 401 || err.status === 403 || msg.includes('authentication') || msg.includes('x-api-key') || msg.includes('api_key')) {
      console.warn('[AI Service] Anthropic auth failed - falling back to demo mode:', msg);
      await new Promise(r => setTimeout(r, 600));
      return generateMockContent(params);
    }
    if (err.status === 429) {
      const e = new Error('Rate limit reached. Please wait a moment and try again.');
      e.status = 429;
      throw e;
    }
    throw err;
  }
};

module.exports = { generateSocialContent, isRealApiKey };
