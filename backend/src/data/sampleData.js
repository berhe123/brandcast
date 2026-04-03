const brandInfo = {
  name: 'mySWOOOP',
  description: 'Germany\'s leading certified refurbished electronics marketplace where people buy and sell used tech at fair prices',
  voice: 'friendly, trustworthy, sustainable, and empowering',
  values: ['sustainability', 'affordability', 'quality', 'transparency', 'circular economy'],
  tagline: 'Gib weiter, was dich weit gebracht hat (Pass on what brought you far)',
  website: 'https://www.myswooop.de',
  socials: {
    facebook: 'https://de-de.facebook.com/myswooop/',
    instagram: 'https://www.instagram.com/myswooop/',
    twitter: 'https://twitter.com/myswooop',
    linkedin: 'https://www.linkedin.com/company/myswooop',
    tiktok: 'https://www.tiktok.com/@myswooop'
  }
};

const samplePosts = [
  {
    id: 'sp1',
    platform: 'facebook',
    tone: 'inspiring',
    contentType: 'post',
    topic: 'Sell your old smartphone',
    content: `📱 Still got an old smartphone gathering dust in a drawer? Don't let it go to waste!\n\nAt mySWOOOP, we turn your pre-loved tech into real money — fast, easy, and sustainable. In just 3 minutes, you'll get a fixed-price offer. We even cover the shipping costs.\n\nBecause every device deserves more than one chapter. ♻️\n\n👉 Find out how much your device is worth today!\n\n#mySWOOOP #SellYourPhone #Refurbished #Sustainability #CircularEconomy`,
    likes: 247,
    reach: 4200
  },
  {
    id: 'sp2',
    platform: 'instagram',
    tone: 'trendy',
    contentType: 'post',
    topic: 'Refurbished iPhone deals',
    content: `✨ Why pay full price when you can go refurbished? 📱\n\nOur certified pre-loved iPhones are tested, polished, and ready for their next adventure — at a fraction of the cost.\n\n🔋 Battery checked\n📸 Camera tested\n✅ 36-month warranty included\n🔄 30-day returns, no questions asked\n\nSwoop in on the deal before it's gone 👇\n\n#mySWOOOP #RefurbishedTech #iPhone #SustainableTech #PreLoved #GoEco #TechDeals #AffordableTech #Refurbished #CircularEconomy #GreenTech #UsedPhones #BuyRefurbished #SaveMoney #TechLovers`,
    likes: 891,
    reach: 15600
  },
  {
    id: 'sp3',
    platform: 'twitter',
    tone: 'casual',
    contentType: 'post',
    topic: 'Sustainability and tech',
    content: `Your old gadgets have stories left to tell 🌍\n\nSell → Refurbish → Re-love\n\nJoin 1M+ people making tech circular with @mySWOOOP ♻️\n\n#GoEco #Refurbished`,
    likes: 156,
    reach: 8900
  },
  {
    id: 'sp4',
    platform: 'facebook',
    tone: 'professional',
    contentType: 'promotion',
    topic: 'New year device upgrade',
    content: `🎉 New Year, New Device — Without Breaking the Bank!\n\nUpgrade your tech setup this year without the premium price tag. At mySWOOOP, our expertly refurbished laptops, smartphones, and tablets come with:\n\n✔️ Rigorous quality checks\n✔️ Up to 36 months warranty\n✔️ 30-day return guarantee\n✔️ Certified data deletion on all trade-ins\n\nOver 930,000 customers have already discovered the smarter way to shop for tech. Ready to join them?\n\n🔗 Shop now at myswooop.de\n\n#mySWOOOP #NewYear #RefurbishedTech #SaveMoney #SmartShopping`,
    likes: 432,
    reach: 7800
  },
  {
    id: 'sp5',
    platform: 'instagram',
    tone: 'inspiring',
    contentType: 'story',
    topic: 'GoEco sustainability campaign',
    content: `🌱 Every device you sell to mySWOOOP is one less device in a landfill.\n\nWe believe in a world where electronics live longer, waste less, and cost less.\n\nThat's the mySWOOOP promise 💚\n\nSwipe to see how it works ➡️\n\n#GoEco #mySWOOOP #Nachhaltigkeit #Sustainability #RefurbishedTech #CircularEconomy #EcoFriendly #GreenTech #PreLovedTech #SaveThePlanet #TechForGood #Refurbished #SecondLife`,
    likes: 1204,
    reach: 22400
  },
  {
    id: 'sp6',
    platform: 'twitter',
    tone: 'witty',
    contentType: 'post',
    topic: 'Trade-in your old laptop',
    content: `Laptop gathering dust? 💻\n\nSell it to us in 3 minutes. We ship it free. You get paid. Everyone wins.\n\nEasy as that 👉 myswooop.de #mySWOOOP #SellYourLaptop`,
    likes: 89,
    reach: 5400
  },
  {
    id: 'sp7',
    platform: 'linkedin',
    tone: 'professional',
    contentType: 'post',
    topic: 'Circular economy in consumer electronics',
    content: `The circular economy isn't just a trend — it's the future of consumer electronics.\n\nAt mySWOOOP, we've helped over 1 million customers buy and sell certified refurbished devices. Every transaction keeps one more device out of a landfill, saves money for buyers, and generates income for sellers.\n\nOur process is built on trust:\n✔ Rigorous quality checks\n✔ Up to 36 months warranty\n✔ Certified data deletion\n✔ 30-day return guarantee\n\nSustainability and affordability aren't opposites. They're the same choice.\n\nExplore how it works at myswooop.de\n\n#mySWOOOP #CircularEconomy #RefurbishedTech #Sustainability`,
    likes: 312,
    reach: 9800
  },
  {
    id: 'sp8',
    platform: 'tiktok',
    tone: 'exciting',
    contentType: 'post',
    topic: 'Score premium tech at half the price',
    content: `POV: You just discovered you can get a certified iPhone for half the price 📱✨\n\nmySWOOOP = tested + guaranteed + eco-friendly\n\nLink in bio 👇 myswooop.de\n\n#mySWOOOP #Refurbished #TechTok #FYP #iPhone`,
    likes: 2104,
    reach: 48200
  }
];

const contentTemplates = [
  {
    id: 'tpl1',
    platform: 'all',
    category: 'Product Promotion',
    name: 'New Arrival Highlight',
    description: 'Showcase a freshly refurbished product',
    fields: { topic: 'New refurbished [PRODUCT] available at mySWOOOP', tone: 'exciting', contentType: 'post' }
  },
  {
    id: 'tpl2',
    platform: 'instagram',
    category: 'Sustainability',
    name: 'GoEco Campaign',
    description: 'Environmental impact and circular economy message',
    fields: { topic: 'Buying refurbished tech reduces e-waste and saves the planet', tone: 'inspiring', contentType: 'post' }
  },
  {
    id: 'tpl3',
    platform: 'facebook',
    category: 'Customer Story',
    name: 'Sell Your Device CTA',
    description: 'Encourage users to sell unused electronics',
    fields: { topic: 'Turn your unused gadgets into money with mySWOOOP', tone: 'friendly', contentType: 'post' }
  },
  {
    id: 'tpl4',
    platform: 'twitter',
    category: 'Quick Tip',
    name: 'Tech Tip Tweet',
    description: 'Short helpful tech or sustainability tip',
    fields: { topic: 'Quick tip about saving money by buying refurbished tech', tone: 'casual', contentType: 'post' }
  },
  {
    id: 'tpl5',
    platform: 'all',
    category: 'Sale & Deals',
    name: 'Special Offer',
    description: 'Promote a limited-time deal or discount',
    fields: { topic: 'Limited time offer on refurbished smartphones at mySWOOOP', tone: 'urgent', contentType: 'promotion' }
  },
  {
    id: 'tpl6',
    platform: 'instagram',
    category: 'Brand Awareness',
    name: 'Brand Story',
    description: 'Tell the mySWOOOP brand mission and values',
    fields: { topic: 'mySWOOOP mission: giving devices their next life', tone: 'inspiring', contentType: 'story' }
  },
  {
    id: 'tpl7',
    platform: 'facebook',
    category: 'Education',
    name: 'What is Refurbished?',
    description: 'Educate audience about refurbished tech',
    fields: { topic: 'What does certified refurbished actually mean and why it is safe to buy', tone: 'educational', contentType: 'post' }
  },
  {
    id: 'tpl8',
    platform: 'all',
    category: 'Seasonal',
    name: 'Holiday Campaign',
    description: 'Seasonal or holiday-themed post',
    fields: { topic: 'Gift a refurbished device this holiday season - great quality, lower price', tone: 'warm', contentType: 'post' }
  }
];

module.exports = { brandInfo, samplePosts, contentTemplates };
