/**
 * Mock AI Content Generator for mySWOOOP
 * Generates realistic social media content when no API key is configured.
 * Produces varied output using randomized templates and mySWOOOP brand data.
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const maybeInclude = (str, probability = 0.6) => Math.random() < probability ? str : '';

// ─── Emoji banks ─────────────────────────────────────────────────────────────
const sustainabilityEmojis = ['♻️', '🌱', '🌍', '💚', '🍃', '🌿'];
const techEmojis = ['📱', '💻', '⌚', '📸', '🎮', '🎧', '🖥️'];
const moneyEmojis = ['💰', '💸', '🤑', '💵', '🏷️'];
const starEmojis = ['✨', '⭐', '🌟', '💫'];
const checkEmojis = ['✅', '☑️', '✔️'];
const rocketEmojis = ['🚀', '⚡', '🔥', '💥'];

// ─── Hashtag packs ─────────────────────────────────────────────────────────
const hashtagPacks = {
  core: ['#mySWOOOP', '#Refurbished', '#RefurbishedTech'],
  sustainability: ['#GoEco', '#CircularEconomy', '#Sustainability', '#GreenTech', '#EcoFriendly', '#Nachhaltigkeit'],
  buy: ['#PreLoved', '#BuyRefurbished', '#SaveMoney', '#TechDeals', '#AffordableTech', '#SecondHandTech'],
  sell: ['#SellYourPhone', '#SellYourLaptop', '#TradeIn', '#OldTech', '#UpgradeTech'],
  products: ['#iPhone', '#Samsung', '#MacBook', '#iPad', '#Laptop', '#Smartphone', '#Smartwatch'],
  general: ['#TechLovers', '#TechLife', '#GadgetLife', '#TechCommunity'],
};

const getHashtags = (platform, tone, topicLower) => {
  const baseHashtags = [...hashtagPacks.core];

  if (topicLower.includes('sell') || topicLower.includes('trade') || topicLower.includes('verkauf')) {
    baseHashtags.push(...hashtagPacks.sell.slice(0, 3));
  } else {
    baseHashtags.push(...hashtagPacks.buy.slice(0, 3));
  }

  if (topicLower.includes('eco') || topicLower.includes('sustain') || topicLower.includes('green') || topicLower.includes('nachhalt')) {
    baseHashtags.push(...hashtagPacks.sustainability.slice(0, 4));
  }

  if (platform === 'instagram') {
    baseHashtags.push(...hashtagPacks.products.slice(0, 3));
    baseHashtags.push(...hashtagPacks.general.slice(0, 2));
    baseHashtags.push(...hashtagPacks.sustainability.slice(0, 2));
    return '\n\n' + [...new Set(baseHashtags)].slice(0, 14).join(' ');
  }

  if (platform === 'facebook') {
    return '\n\n' + [...new Set(baseHashtags)].slice(0, 4).join(' ');
  }

  if (platform === 'linkedin') {
    baseHashtags.push('#CircularEconomy', '#Sustainability', '#RefurbishedTech');
    return '\n\n' + [...new Set(baseHashtags)].slice(0, 5).join(' ');
  }

  if (platform === 'tiktok') {
    return ' #mySWOOOP #Refurbished #TechTok #FYP';
  }

  // Twitter: 1-2 hashtags woven in
  return ` ${hashtagPacks.core[0]} #Refurbished`;
};

// ─── German templates ─────────────────────────────────────────────────────
const germanTemplates = {
  facebook: {
    friendly: [
      (topic, e) => `${e.star} Große Neuigkeiten für alle Tech-Liebhaber!\n\n${topic} — und das zu unschlagbaren Preisen.\n\nBei mySWOOOP bekommst du geprüfte Gebrauchtgeräte mit bis zu 36 Monaten Garantie und 30 Tagen Rückgaberecht. Über 1 Million zufriedene Kunden können sich nicht irren! ${e.check}\n\n${e.rocket} Jetzt entdecken auf myswooop.de`,
      (topic, e) => `Hey! ${e.wave}\n\n${topic} – klingt das nicht toll?\n\nMit mySWOOOP geht das ganz einfach. Wir prüfen jedes Gerät auf Herz und Nieren, bevor es zu dir kommt. Qualität, die du spürst – Preis, der dich freut. ${e.money}\n\nJetzt auf myswooop.de stöbern!`,
    ],
    professional: [
      (topic, e) => `${topic}\n\nmySWOOOP bietet Ihnen:\n${e.check} Bis zu 36 Monate Garantie\n${e.check} 30 Tage Rückgaberecht\n${e.check} Zertifizierte Datenlöschung\n${e.check} 97% Kundenzufriedenheit\n\nMehr als 1 Million Kunden vertrauen bereits auf mySWOOOP. Überzeugen Sie sich selbst – myswooop.de`,
    ],
    inspiring: [
      (topic, e) => `${e.green} ${topic}\n\nBei mySWOOOP glauben wir daran, dass jedes Gerät mehr als ein Leben verdient. Gib weiter, was dich weit gebracht hat – und gib einem anderen Gerät eine neue Chance.\n\nGemeinsam machen wir Technik nachhaltiger. ${e.eco}\n\nmyswooop.de`,
    ],
  },
  instagram: {
    trendy: [
      (topic, e) => `${e.star} ${topic} ${e.tech}\n\nGebraucht ist das neue Neu. Pre-loved Tech von mySWOOOP:\n\n${e.check} Geprüfte Qualität\n${e.check} Faire Preise\n${e.check} Garantie inklusive\n${e.check} 30 Tage Rücksendung\n\nJetzt auf myswooop.de`,
    ],
    inspiring: [
      (topic, e) => `${e.green} ${topic}\n\nJeder Kauf bei mySWOOOP ist ein Schritt zu mehr Nachhaltigkeit ${e.eco}\n\nWeniger Elektroschrott. Mehr Kreislauf. Mehr Sinn.\n\n#GoEco mit mySWOOOP 💚`,
    ],
  },
  twitter: {
    casual: [
      (topic, e) => `${topic} ${e.tech}\n\nBei mySWOOOP: Ankauf in 3 Minuten, kostenloser Versand, Top-Preis. ${e.money}\n\nmyswooop.de`,
      (topic, e) => `${e.eco} ${topic}\n\nAlt verkaufen. Neu denken. Mit mySWOOOP. ♻️`,
    ],
  },
};

// ─── English templates ─────────────────────────────────────────────────────
const buildEnglishContent = ({ platform, topic, tone, contentType, targetAudience, includeEmoji }) => {
  const e = includeEmoji ? {
    tech: pick(techEmojis),
    green: pick(sustainabilityEmojis),
    eco: pick(sustainabilityEmojis),
    money: pick(moneyEmojis),
    star: pick(starEmojis),
    check: pick(checkEmojis),
    rocket: pick(rocketEmojis),
    wave: '👋',
  } : { tech: '', green: '', eco: '', money: '', star: '', check: '✓', rocket: '→', wave: '' };

  const toneData = {
    professional: {
      openers: [
        `Introducing a smarter way to get tech: ${topic}.`,
        `${topic} — quality you can trust, prices that make sense.`,
        `At mySWOOOP, we're redefining how you experience technology.`,
      ],
      ctas: [
        'Discover more at myswooop.de',
        'Explore our certified refurbished selection at myswooop.de',
        'Visit myswooop.de to learn more.',
      ],
      middles: [
        `With over 1 million happy customers and up to 36 months warranty, mySWOOOP is Germany's most trusted refurbished tech marketplace.`,
        `Every device is rigorously tested by our experts — so you get quality that performs, at a price that respects your budget.`,
        `We offer 30-day returns, certified data deletion, and outstanding customer support. Your satisfaction is our priority.`,
      ],
    },
    friendly: {
      openers: [
        `Great news for tech lovers! ${e.star} ${topic}`,
        `Hey there! ${e.wave} Looking for something exciting? ${topic}`,
        `We've got something special for you! ${topic} ${e.rocket}`,
      ],
      ctas: [
        `Check it out at myswooop.de ${e.rocket}`,
        `Grab yours now at myswooop.de!`,
        `Don't miss out — head over to myswooop.de`,
      ],
      middles: [
        `At mySWOOOP, we make sure every device is checked, cleaned, and ready for its next adventure. And with 30-day returns, you can shop with total confidence!`,
        `We've already made over 1 million customers happy — and we'd love to make you one of them! ${e.star}`,
        `Think refurbished means lower quality? Think again. Our devices undergo thorough testing and come with up to 36 months warranty.`,
      ],
    },
    inspiring: {
      openers: [
        `${e.green} ${topic} — because every device deserves more than one story.`,
        `${e.star} Imagine a world where great tech is accessible to everyone. That's what we're building at mySWOOOP.`,
        `${topic} ${e.eco} — pass on what brought you far.`,
      ],
      ctas: [
        `Join the circular tech movement at myswooop.de ${e.green}`,
        `Be part of the change. Start at myswooop.de`,
        `Give tech a second life — myswooop.de ${e.eco}`,
      ],
      middles: [
        `Over 930,000 customers have already discovered a smarter, greener way to use technology. Every sale and purchase keeps one more device out of a landfill.`,
        `At mySWOOOP, sustainability isn't a buzzword — it's at the heart of everything we do. Refurbish. Reuse. Re-love.`,
        `We believe in the circular economy: when you're done with your device, its story doesn't have to end. Sell it. Let it bring joy to someone new.`,
      ],
    },
    exciting: {
      openers: [
        `${e.rocket} BIG news! ${topic}`,
        `${e.star} You won't want to miss this! ${topic} ${e.rocket}`,
        `This is HUGE! ${topic} ${e.star}`,
      ],
      ctas: [
        `Grab it NOW at myswooop.de! ${e.rocket}`,
        `Don't wait — shop now at myswooop.de ${e.star}`,
        `Limited availability! Check myswooop.de NOW ${e.rocket}`,
      ],
      middles: [
        `mySWOOOP is making waves with incredible deals on certified refurbished tech. Quality tested, warranty included, and prices that'll make you do a double take! ${e.money}`,
        `With up to 36 months warranty, 30-day returns, and prices you won't find anywhere else — this is the deal you've been waiting for! ${e.star}`,
        `Our team of experts checks every single device so you don't have to worry about quality. Just enjoy the savings! ${e.money}`,
      ],
    },
    educational: {
      openers: [
        `Did you know? ${topic}`,
        `Here's something worth knowing: ${topic}`,
        `${e.check} Quick guide: ${topic}`,
      ],
      ctas: [
        `Learn more and shop at myswooop.de`,
        `See what's available at myswooop.de`,
        `Find out more at myswooop.de`,
      ],
      middles: [
        `Refurbished means a device has been professionally inspected, repaired if needed, cleaned, and tested to meet strict quality standards. mySWOOOP's certified process ensures every item is as good as it looks.`,
        `Buying refurbished saves you money — up to 50% off retail price — while reducing e-waste. mySWOOOP backs every device with up to 36 months warranty, so quality is never a concern.`,
        `At mySWOOOP, selling your old device takes only 3 minutes: get an instant quote, ship for free (over €30), and get paid fast. It's that simple.`,
      ],
    },
    witty: {
      openers: [
        `${e.tech} Confession: we're obsessed with giving old tech new lives. ${topic}`,
        `Who said pre-loved means pre-loved quality? Not us. ${topic} ${e.star}`,
        `Plot twist: you CAN have premium tech without the premium price. ${topic}`,
      ],
      ctas: [
        `Your wallet called. It said: myswooop.de ${e.money}`,
        `Turns out, smart shopping looks a lot like myswooop.de ${e.star}`,
        `Go on, treat yourself (responsibly). myswooop.de ${e.rocket}`,
      ],
      middles: [
        `Think of it this way: buying refurbished at mySWOOOP means more tech, less guilt, and a fatter wallet. Triple win. ${e.money}`,
        `We test every device like it's going to our best friend. Because honestly, it probably is. 30-day returns, 36-month warranty, zero stress.`,
        `Fun fact: over a million people have discovered that "refurbished" is just another word for "brilliant deal". Join the club. ${e.star}`,
      ],
    },
    urgent: {
      openers: [
        `⚡ Limited time! ${topic}`,
        `${e.rocket} Act fast! ${topic}`,
        `⏰ Don't miss out! ${topic}`,
      ],
      ctas: [
        `Shop NOW before it's gone → myswooop.de ⚡`,
        `Grab yours while stock lasts → myswooop.de`,
        `This won't last — check it out NOW at myswooop.de ${e.rocket}`,
      ],
      middles: [
        `mySWOOOP certified refurbished devices are flying off the shelves. With up to 36 months warranty and 30-day returns, hesitation costs you more than the deal.`,
        `Top-condition devices. Expert-tested quality. Unbeatable prices. And yes — this deal is real. But availability is limited! ${e.rocket}`,
        `Our customers don't wait. Over 1 million already got their deals — now it's your turn. Time is ticking! ⚡`,
      ],
    },
    warm: {
      openers: [
        `${e.star} There's something special about giving a device a new home. ${topic}`,
        `We love connecting people with great tech. ${topic} ${e.green}`,
        `Every device has memories. And at mySWOOOP, it can make new ones. ${topic}`,
      ],
      ctas: [
        `Find your perfect match at myswooop.de ${e.star}`,
        `Start your story at myswooop.de ${e.green}`,
        `We'd love to find the right device for you — myswooop.de`,
      ],
      middles: [
        `At mySWOOOP, we believe technology should bring people together, not create barriers. That's why we offer certified refurbished devices at prices that work for everyone.`,
        `We've helped over 1 million customers find their perfect tech companion. Each device is lovingly tested and comes with up to 36 months warranty — because we care about your experience.`,
        `Your old device has given you so much. Now it can give someone else just as much joy. Sell it with mySWOOOP and become part of a community that believes in sharing.`,
      ],
    },
  };

  const toneKey = toneData[tone] ? tone : 'friendly';
  const td = toneData[toneKey];

  // ─── Platform-specific templates ─────────────────────────────────────────
  if (platform === 'twitter') {
    // Twitter: ≤280 chars, concise
    const twitterTemplates = [
      `${pick(td.openers).slice(0, 120)}\n\n${pick(td.ctas)}`,
      `${topic} ${e.tech}\n\n${maybeInclude('Up to 36M warranty. 30-day returns. ')}1M+ happy customers.\n\n${pick(td.ctas)}`,
      `${e.rocket} ${topic}\n\nmySWOOOP: certified, tested, trusted.\n\n${pick(td.ctas)}`,
      `${e.star} ${topic}\n\nRefurbished done right. ${e.check} Warranty included.\n\nmyswooop.de`,
    ];

    let tweet = pick(twitterTemplates);
    // Ensure ≤280 chars
    if (tweet.length > 280) tweet = tweet.slice(0, 277) + '...';
    return tweet;
  }

  if (platform === 'linkedin') {
    // LinkedIn: professional, structured, business-focused
    const linkedInOpeners = [
      `${topic} — and it changes the way we think about technology.`,
      `At mySWOOOP, we believe quality doesn’t have to come with a premium price tag.`,
      `Here’s what 1 million customers have already discovered: ${topic}`,
    ];
    const linkedInMiddles = [
      `Refurbished electronics are no longer a compromise — they’re a smarter choice. Every device sold through mySWOOOP is professionally tested, cleaned, and backed by up to 36 months warranty.\n\nWe’ve built a platform that makes buying and selling pre-loved tech transparent, safe, and rewarding.`,
      `The circular economy is the future of consumer electronics. At mySWOOOP, we’ve helped divert over 1 million devices from landfill while delivering real value to buyers and sellers alike.\n\nQuality checks. Certified data deletion. 30-day returns. Our process is built on trust.`,
      `Sustainability and affordability aren’t opposites. With mySWOOOP, customers save up to 50% versus retail while reducing e-waste and supporting a circular economy.\n\nEvery purchase is a step toward a more responsible tech industry.`,
    ];
    const linkedInCtas = [
      'Explore our full range at myswooop.de',
      'Learn more at myswooop.de →',
      'Visit myswooop.de to see how it works.',
    ];
    return `${pick(linkedInOpeners)}\n\n${pick(linkedInMiddles)}\n\n${pick(linkedInCtas)}`;
  }

  if (platform === 'tiktok') {
    // TikTok: punchy hook, short, energetic
    const ttTemplates = [
      `${e.rocket} POV: You just found out about ${topic}\n\nRefurbished tech from mySWOOOP hits different ${e.tech}\nWarranty ✅ Low price ✅ Sustainable ✅\n\nmyswooop.de`,
      `Wait… ${topic}?! ${e.star}\n\nYep. At mySWOOOP you get certified refurbished devices at prices that make sense ${e.money}\n\nLink in bio → myswooop.de`,
      `${e.tech} ${topic}\n\nStop overpaying for new.\nmySWOOOP: tested, guaranteed, sustainable.\n\n#mySWOOOP`,
      `Real talk: ${topic} ${e.rocket}\n\nAt mySWOOOP:
✔ Up to 36 months warranty
✔ 30-day returns
✔ Eco-friendly choice ${e.green}\n\nmyswooop.de`,
    ];
    let tt = pick(ttTemplates);
    if (tt.length > 300) tt = tt.slice(0, 297) + '...';
    return tt;
  }

  if (platform === 'instagram') {
    // Instagram: visual, hook-first, line breaks, longer
    const hooks = [
      `${e.star} ${topic}`,
      `${e.rocket} Stop scrolling. ${topic}`,
      `${e.tech} Just in: ${topic}`,
      `${e.green} This is important. ${topic}`,
    ];

    const benefits = [
      `\n\n${e.check} Expert-tested quality\n${e.check} Up to 36 months warranty\n${e.check} 30-day return guarantee\n${e.check} Certified data deletion`,
      `\n\n${e.check} Verified refurbished\n${e.check} 97% customer satisfaction\n${e.check} 1M+ happy customers\n${e.check} Free shipping over €30`,
    ];

    const cta = pick(td.ctas);

    return `${pick(hooks)}${pick(benefits)}\n\n${cta}`;
  }

  // Facebook: balanced, community-focused
  const opener = pick(td.openers);
  const middle = pick(td.middles);
  const cta = pick(td.ctas);

  if (contentType === 'promotion') {
    return `${e.rocket} SPECIAL OFFER: ${topic}\n\n${middle}\n\n${e.check} Up to 36 months warranty\n${e.check} 30-day returns\n${e.check} Secure payment\n\n${cta}`;
  }

  if (contentType === 'story') {
    return `${opener}\n\n${middle}\n\n${cta}`;
  }

  if (contentType === 'announcement') {
    return `${e.rocket} ANNOUNCEMENT: ${topic}\n\n${middle}\n\n${cta}`;
  }

  if (contentType === 'engagement') {
    const questions = [
      'What would you do with the money you saved?',
      'Tell us in the comments — what device would you love to find refurbished? 👇',
      'Have you ever bought or sold refurbished tech? Share your experience below! 💬',
      'What\'s your next tech upgrade going to be?',
    ];
    return `${opener}\n\n${middle}\n\n${pick(questions)}`;
  }

  return `${opener}\n\n${middle}\n\n${cta}`;
};

// ─── Main mock generator function ────────────────────────────────────────────
const generateMockContent = ({ platform, topic, tone, contentType, targetAudience, language, includeHashtags, includeEmoji }) => {
  const topicLower = topic.toLowerCase();

  // German content
  if (language === 'german') {
    // LinkedIn and TikTok fall back to similar platforms for German templates
    const platformKey = platform === 'linkedin' ? 'facebook' : platform === 'tiktok' ? 'twitter' : platform;
    const platformTemplates = germanTemplates[platformKey];
    const toneTemplates = platformTemplates?.[tone] || platformTemplates?.friendly || germanTemplates.facebook.friendly;
    const templateFn = pick(toneTemplates);
    const emojis = includeEmoji ? {
      tech: pick(techEmojis),
      green: pick(sustainabilityEmojis),
      eco: pick(sustainabilityEmojis),
      money: pick(moneyEmojis),
      star: pick(starEmojis),
      check: pick(checkEmojis),
      rocket: pick(rocketEmojis),
      wave: '👋',
    } : { tech: '', green: '', eco: '', money: '', star: '', check: '✓', rocket: '→', wave: '' };

    let content = templateFn(topic, emojis);
    if (includeHashtags) {
      content += getHashtags(platform, tone, topicLower);
    }
    if (!includeEmoji) {
      content = content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|♻️|✅|☑️|✔️|⚡|🚀|💚|🌱/gu, '').replace(/\s+/g, ' ').trim();
    }
    return content;
  }

  // English content
  let content = buildEnglishContent({ platform, topic, tone, contentType, targetAudience, includeEmoji });

  if (includeHashtags) {
    content += getHashtags(platform, tone, topicLower);
  }

  if (!includeEmoji) {
    // Strip emoji characters
    content = content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|♻️|✅|☑️|✔️|⚡|🚀|💚|🌱/gu, '').replace(/  +/g, ' ').trim();
  }

  // Enforce platform char limits for all platforms
  const platformLimits = { facebook: 500, instagram: 300, twitter: 280, linkedin: 600, tiktok: 300 };
  const charLimit = platformLimits[platform];
  if (charLimit && content.length > charLimit) {
    const trimmed = content.slice(0, charLimit - 1);
    const lastBreak = Math.max(trimmed.lastIndexOf('\n'), trimmed.lastIndexOf(' '));
    content = (lastBreak > charLimit * 0.6 ? trimmed.slice(0, lastBreak) : trimmed).trimEnd() + '…';
  }

  return content;
};

module.exports = { generateMockContent };
