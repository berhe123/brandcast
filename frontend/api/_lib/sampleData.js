/**
 * Demo data for VibePost
 * -----------------------
 * VibePost is brand-agnostic: real content is generated against whatever brand
 * the user creates. The objects below are only used for the demo/sample feeds
 * and as a neutral fallback brand context, so the product showcases well out of
 * the box without being tied to any real company.
 */

// Neutral example brand used as a fallback context for the AI.
const brandInfo = {
  name: 'Aura',
  description: 'A modern lifestyle brand making everyday essentials people genuinely love',
  voice: 'warm, confident, and effortlessly helpful',
  values: ['quality', 'simplicity', 'sustainability', 'delight'],
  tagline: 'Live a little brighter',
  website: 'https://example.com',
  socials: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    tiktok: 'https://tiktok.com'
  }
};

// Example posts shown in the "samples" feed — generic, on-trend marketing copy.
const samplePosts = [
  {
    id: 'sp1',
    platform: 'facebook',
    tone: 'inspiring',
    contentType: 'post',
    topic: 'Launching our new collection',
    content: `✨ Something new is here — and we think you're going to love it.\n\nWe spent months sweating the details so you don't have to. Thoughtful design, honest quality, and a price that feels right.\n\nBecause the everyday deserves a little magic. 💫\n\n👉 Be the first to explore the new collection.\n\n#NewArrivals #DesignedForYou #EverydayEssentials`,
    likes: 247,
    reach: 4200
  },
  {
    id: 'sp2',
    platform: 'instagram',
    tone: 'exciting',
    contentType: 'post',
    topic: 'Behind the scenes of our latest drop',
    content: `👀 POV: you get a sneak peek before anyone else.\n\nHere's what went into our latest drop — late nights, way too many prototypes, and a team that refused to settle.\n\nWorth it? Swipe and decide. 👉\n\n#BehindTheScenes #ComingSoon #MadeWithLove #NewDrop #StudioLife`,
    likes: 891,
    reach: 15600
  },
  {
    id: 'sp3',
    platform: 'twitter',
    tone: 'witty',
    contentType: 'post',
    topic: 'Why simple beats complicated',
    content: `Hot take: the best products get out of your way.\n\nNo manual. No friction. Just works.\n\nThat's the whole brief. ✅`,
    likes: 156,
    reach: 8900
  },
  {
    id: 'sp4',
    platform: 'facebook',
    tone: 'professional',
    contentType: 'promotion',
    topic: 'Limited-time launch offer',
    content: `🎉 Launch week is on — and so is our best offer of the season.\n\nFor a limited time, get our most-loved essentials with free shipping and a 30-day happiness guarantee.\n\n✔️ Designed to last\n✔️ Loved by thousands\n✔️ Risk-free to try\n\nReady to make the switch?\n\n🔗 Shop the launch today.\n\n#LaunchWeek #LimitedOffer #ShopNow`,
    likes: 432,
    reach: 7800
  },
  {
    id: 'sp5',
    platform: 'instagram',
    tone: 'inspiring',
    contentType: 'story',
    topic: 'Our sustainability promise',
    content: `🌱 Small choices, made often, change everything.\n\nThat's why every product we make is built to last longer, waste less, and feel better to own.\n\nProgress over perfection — one step at a time. 💚\n\nSwipe to see how we're doing it ➡️\n\n#Sustainability #MadeToLast #ConsciousLiving #BrandWithPurpose`,
    likes: 1204,
    reach: 22400
  },
  {
    id: 'sp6',
    platform: 'twitter',
    tone: 'friendly',
    contentType: 'post',
    topic: 'A quick thank you to our community',
    content: `10,000 of you. 🤯\n\nThank you for every order, every review, and every DM.\n\nWe're just getting started — and you're the reason why. 💛`,
    likes: 89,
    reach: 5400
  },
  {
    id: 'sp7',
    platform: 'linkedin',
    tone: 'professional',
    contentType: 'post',
    topic: 'What building in public taught us',
    content: `Building in public taught us one thing above all: customers don't want perfect — they want honest.\n\nThis year we shipped faster, listened harder, and turned feedback into our roadmap.\n\nThree lessons that stuck:\n→ Talk to customers before you build, not after\n→ Ship small, ship often, learn always\n→ Culture isn't a poster — it's what you reward\n\nGrateful for a team and community that makes the work meaningful.\n\n#BuildInPublic #StartupLessons #ProductStrategy`,
    likes: 312,
    reach: 9800
  },
  {
    id: 'sp8',
    platform: 'tiktok',
    tone: 'exciting',
    contentType: 'post',
    topic: 'The upgrade you did not know you needed',
    content: `POV: you finally upgraded the one thing you use every single day ✨\n\nLittle change. Big difference. 🙌\n\nLink in bio 👇\n\n#TikTokMadeMeBuyIt #Upgrade #DailyEssentials #FYP`,
    likes: 2104,
    reach: 48200
  }
];

// Reusable, brand-agnostic templates — prefill the generator for any brand.
const contentTemplates = [
  {
    id: 'tpl1',
    platform: 'all',
    category: 'Product Promotion',
    name: 'New Arrival Highlight',
    description: 'Announce a new product and the one reason people will love it',
    fields: { topic: 'Introducing our newest product and why it stands out', tone: 'exciting', contentType: 'post' }
  },
  {
    id: 'tpl2',
    platform: 'instagram',
    category: 'Brand Story',
    name: 'Behind the Scenes',
    description: 'Pull back the curtain on how something gets made',
    fields: { topic: 'A behind-the-scenes look at how we built our latest product', tone: 'friendly', contentType: 'story' }
  },
  {
    id: 'tpl3',
    platform: 'facebook',
    category: 'Customer Story',
    name: 'Customer Spotlight',
    description: 'Turn a happy customer into social proof',
    fields: { topic: 'A customer success story that shows the real impact of our product', tone: 'warm', contentType: 'post' }
  },
  {
    id: 'tpl4',
    platform: 'twitter',
    category: 'Quick Tip',
    name: 'Value Tip',
    description: 'Share a short, genuinely useful tip your audience will save',
    fields: { topic: 'A quick, practical tip our audience can use today', tone: 'casual', contentType: 'post' }
  },
  {
    id: 'tpl5',
    platform: 'all',
    category: 'Sale & Deals',
    name: 'Limited-Time Offer',
    description: 'Drive urgency around a deal or launch window',
    fields: { topic: 'A limited-time offer customers should not miss', tone: 'urgent', contentType: 'promotion' }
  },
  {
    id: 'tpl6',
    platform: 'instagram',
    category: 'Brand Awareness',
    name: 'Mission & Values',
    description: 'Say what you stand for in a way people remember',
    fields: { topic: 'Our mission and the values behind everything we make', tone: 'inspiring', contentType: 'story' }
  },
  {
    id: 'tpl7',
    platform: 'linkedin',
    category: 'Thought Leadership',
    name: 'Lesson Learned',
    description: 'Share an insight that positions you as an expert',
    fields: { topic: 'A lesson we learned this year and what it means for our customers', tone: 'professional', contentType: 'post' }
  },
  {
    id: 'tpl8',
    platform: 'all',
    category: 'Seasonal',
    name: 'Seasonal Campaign',
    description: 'Tie your product to a season, holiday, or moment',
    fields: { topic: 'A seasonal campaign that connects our product to this time of year', tone: 'warm', contentType: 'post' }
  }
];

module.exports = { brandInfo, samplePosts, contentTemplates };
