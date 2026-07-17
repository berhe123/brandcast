/**
 * Model Context Protocol (MCP) — Brandcast tool runtime
 * ------------------------------------------------------
 * Standardized connectors so AI generation can pull live context from:
 *   • external tools
 *   • data sources
 *   • databases
 *   • applications
 *   • CRMs
 *
 * Each connector exposes: connect / disconnect / status / invoke
 * Without real credentials, connectors run in demo mode with realistic payloads.
 */

const { researchBrandFromWebsite, mcpToBrandInfo } = require('./mcpBrandResearch');

const CATALOG = [
  {
    id: 'marketing.website',
    protocol: 'Marketing Context Protocol',
    category: 'marketing',
    name: 'Website brand research',
    description: 'Study a company website to extract voice, industry, audience, and offerings.',
    icon: 'globe',
    authFields: [{ key: 'website', label: 'Website URL', type: 'url', required: true }],
    tools: ['research_brand'],
  },
  {
    id: 'crm.hubspot',
    protocol: 'Model Context Protocol',
    category: 'crm',
    name: 'HubSpot CRM',
    description: 'Read contacts, deals, and lifecycle stages for personalized campaigns.',
    icon: 'users',
    authFields: [{ key: 'apiKey', label: 'Private app token', type: 'password', required: false }],
    tools: ['list_contacts', 'list_deals', 'crm_summary'],
  },
  {
    id: 'crm.salesforce',
    protocol: 'Model Context Protocol',
    category: 'crm',
    name: 'Salesforce',
    description: 'Connect Salesforce leads and opportunities as marketing context.',
    icon: 'cloud',
    authFields: [
      { key: 'instanceUrl', label: 'Instance URL', type: 'url', required: false },
      { key: 'accessToken', label: 'Access token', type: 'password', required: false },
    ],
    tools: ['list_leads', 'list_opportunities', 'crm_summary'],
  },
  {
    id: 'db.postgres',
    protocol: 'Model Context Protocol',
    category: 'database',
    name: 'PostgreSQL',
    description: 'Query product, customer, or analytics tables for factual post data.',
    icon: 'database',
    authFields: [{ key: 'connectionString', label: 'Connection string', type: 'password', required: false }],
    tools: ['list_tables', 'sample_rows', 'db_summary'],
  },
  {
    id: 'db.mysql',
    protocol: 'Model Context Protocol',
    category: 'database',
    name: 'MySQL',
    description: 'Pull catalog and order insights from MySQL for on-brand promotions.',
    icon: 'database',
    authFields: [{ key: 'connectionString', label: 'Connection string', type: 'password', required: false }],
    tools: ['list_tables', 'sample_rows', 'db_summary'],
  },
  {
    id: 'data.csv_url',
    protocol: 'Model Context Protocol',
    category: 'data_source',
    name: 'CSV / data feed',
    description: 'Ingest a public CSV or JSON feed as a structured data source.',
    icon: 'file',
    authFields: [{ key: 'url', label: 'CSV or JSON URL', type: 'url', required: true }],
    tools: ['preview_rows', 'data_summary'],
  },
  {
    id: 'app.slack',
    protocol: 'Model Context Protocol',
    category: 'application',
    name: 'Slack',
    description: 'Read channel themes and announcements to mirror internal messaging.',
    icon: 'message',
    authFields: [{ key: 'botToken', label: 'Bot token', type: 'password', required: false }],
    tools: ['list_channels', 'recent_messages', 'app_summary'],
  },
  {
    id: 'app.notion',
    protocol: 'Model Context Protocol',
    category: 'application',
    name: 'Notion',
    description: 'Pull brand guidelines and campaign briefs from Notion pages.',
    icon: 'book',
    authFields: [{ key: 'apiKey', label: 'Integration token', type: 'password', required: false }],
    tools: ['list_pages', 'brand_guidelines', 'app_summary'],
  },
  {
    id: 'app.google_sheets',
    protocol: 'Model Context Protocol',
    category: 'application',
    name: 'Google Sheets',
    description: 'Use product lists, promo calendars, or KPI sheets as generation context.',
    icon: 'table',
    authFields: [{ key: 'sheetUrl', label: 'Sheet URL or ID', type: 'text', required: false }],
    tools: ['preview_sheet', 'app_summary'],
  },
  {
    id: 'app.airtable',
    protocol: 'Model Context Protocol',
    category: 'data_source',
    name: 'Airtable',
    description: 'Sync content calendars and asset libraries from Airtable bases.',
    icon: 'grid',
    authFields: [
      { key: 'apiKey', label: 'API key', type: 'password', required: false },
      { key: 'baseId', label: 'Base ID', type: 'text', required: false },
    ],
    tools: ['list_tables', 'sample_records', 'data_summary'],
  },
];

const demoCrm = () => ({
  contacts: [
    { name: 'Alex Rivera', email: 'alex@example.com', stage: 'customer', tags: ['loyalty', 'local'] },
    { name: 'Sam Chen', email: 'sam@startup.io', stage: 'lead', tags: ['b2b', 'trial'] },
    { name: 'Jordan Lee', email: 'jordan@mail.com', stage: 'subscriber', tags: ['newsletter'] },
  ],
  deals: [
    { name: 'Spring catering', amount: 4200, stage: 'negotiation' },
    { name: 'Wholesale starter', amount: 1800, stage: 'qualified' },
  ],
  summary: 'CRM mix: mostly local loyalty customers + a few B2B leads. Top opportunity: spring catering.',
});

const demoDb = (engine) => ({
  engine,
  tables: ['products', 'customers', 'orders', 'campaigns'],
  products: [
    { sku: 'LATTE-01', name: 'House Latte', price: 4.5, stock: 120 },
    { sku: 'PASTRY-03', name: 'Almond croissant', price: 3.75, stock: 48 },
    { sku: 'BAG-01', name: '12oz beans', price: 16, stock: 80 },
  ],
  summary: `${engine} snapshot: top sellers are House Latte and Almond croissant; bean bags convert well for take-home offers.`,
});

const demoApp = (app) => {
  const map = {
    slack: {
      channels: ['#marketing', '#general', '#launches'],
      themes: ['weekend hours', 'seasonal drinks', 'community events'],
      summary: 'Slack chatter centers on weekend hours and seasonal drink drops.',
    },
    notion: {
      pages: ['Brand voice', 'Q3 campaign brief', 'Offer matrix'],
      voice: 'Warm, local, quality-obsessed',
      summary: 'Notion brand voice: warm + local. Active brief pushes community events.',
    },
    google_sheets: {
      columns: ['week', 'offer', 'channel', 'cta'],
      rows: [
        { week: 1, offer: 'Buy 1 get 1 pastry', channel: 'instagram', cta: 'Visit this weekend' },
        { week: 2, offer: 'Bean club signup', channel: 'email', cta: 'Join the club' },
      ],
      summary: 'Sheet calendar highlights pastry BOGO then bean-club acquisition.',
    },
    airtable: {
      tables: ['Content calendar', 'Assets', 'Personas'],
      summary: 'Airtable calendar is filled for 4 weeks with persona-tagged assets.',
    },
  };
  return map[app] || { summary: `${app} connected in demo mode.` };
};

const catalogById = Object.fromEntries(CATALOG.map((c) => [c.id, c]));

async function invokeTool(connectorId, tool, config = {}, input = {}) {
  const meta = catalogById[connectorId];
  if (!meta) throw Object.assign(new Error('Unknown connector'), { status: 404 });

  const live = Boolean(
    config.apiKey || config.accessToken || config.botToken || config.connectionString || config.sheetUrl
  );

  // ── Marketing Context Protocol ───────────────────────────────────────────
  if (connectorId === 'marketing.website' && tool === 'research_brand') {
    const website = input.website || config.website;
    if (!website) throw Object.assign(new Error('Website URL required'), { status: 400 });
    const mcp = await researchBrandFromWebsite(website, {
      name: input.name || config.name || '',
      description: input.description || config.description || '',
    });
    return {
      tool,
      connectorId,
      protocol: 'Marketing Context Protocol',
      live: mcp.source === 'website',
      mode: mcp.source === 'website' ? 'live' : 'fallback',
      data: { mcp, brandInfo: mcpToBrandInfo(mcp, { website, name: input.name, description: input.description }) },
    };
  }

  // ── CRM ──────────────────────────────────────────────────────────────────
  if (connectorId.startsWith('crm.')) {
    const data = demoCrm();
    if (tool === 'list_contacts') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { contacts: data.contacts } };
    if (tool === 'list_deals' || tool === 'list_opportunities') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { deals: data.deals } };
    if (tool === 'list_leads') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { leads: data.contacts.filter((c) => c.stage === 'lead') } };
    if (tool === 'crm_summary') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { summary: data.summary, contacts: data.contacts.length, deals: data.deals.length } };
  }

  // ── Databases ────────────────────────────────────────────────────────────
  if (connectorId.startsWith('db.')) {
    const engine = connectorId.includes('mysql') ? 'MySQL' : 'PostgreSQL';
    const data = demoDb(engine);
    if (tool === 'list_tables') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { tables: data.tables } };
    if (tool === 'sample_rows') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { products: data.products } };
    if (tool === 'db_summary') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { summary: data.summary, products: data.products } };
  }

  // ── Data sources ─────────────────────────────────────────────────────────
  if (connectorId === 'data.csv_url') {
    const url = input.url || config.url;
    if (tool === 'preview_rows' || tool === 'data_summary') {
      let rows = [];
      let summary = 'No feed loaded — using demo merchandising rows.';
      if (url) {
        try {
          const res = await fetch(url, {
            signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
          });
          const text = await res.text();
          if (url.endsWith('.json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
            const parsed = JSON.parse(text);
            rows = Array.isArray(parsed) ? parsed.slice(0, 8) : [parsed];
            summary = `Loaded JSON feed from ${url} (${rows.length} sample records).`;
          } else {
            const lines = text.split(/\r?\n/).filter(Boolean).slice(0, 9);
            const headers = lines[0]?.split(',') || [];
            rows = lines.slice(1).map((line) => {
              const cols = line.split(',');
              return Object.fromEntries(headers.map((h, i) => [h.trim(), (cols[i] || '').trim()]));
            });
            summary = `Loaded CSV feed from ${url} (${rows.length} sample rows).`;
          }
        } catch {
          rows = demoDb('CSV').products;
          summary = `Could not fetch feed — demo product rows attached.`;
        }
      } else {
        rows = demoDb('CSV').products;
      }
      return { tool, connectorId, protocol: 'Model Context Protocol', live: Boolean(url), mode: url ? 'live' : 'demo', data: { rows, summary } };
    }
  }

  if (connectorId === 'app.airtable') {
    const data = demoApp('airtable');
    if (tool === 'list_tables') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { tables: data.tables } };
    if (tool === 'sample_records' || tool === 'data_summary') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data };
  }

  // ── Applications ─────────────────────────────────────────────────────────
  if (connectorId === 'app.slack') {
    const data = demoApp('slack');
    if (tool === 'list_channels') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data: { channels: data.channels } };
    if (tool === 'recent_messages' || tool === 'app_summary') return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data };
  }
  if (connectorId === 'app.notion') {
    const data = demoApp('notion');
    if (tool === 'list_pages' || tool === 'brand_guidelines' || tool === 'app_summary') {
      return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data };
    }
  }
  if (connectorId === 'app.google_sheets') {
    const data = demoApp('google_sheets');
    if (tool === 'preview_sheet' || tool === 'app_summary') {
      return { tool, connectorId, protocol: 'Model Context Protocol', live, mode: live ? 'live-proxy' : 'demo', data };
    }
  }

  throw Object.assign(new Error(`Tool "${tool}" is not available on ${connectorId}`), { status: 400 });
}

/**
 * Built-in connectors — always active. No Integrations page or manual wiring.
 * Marketing Context uses the brand website; Model Context pulls CRM/DB/apps
 * (live when env/credentials exist, otherwise realistic demo payloads).
 */
function builtinConnections(brandInfo = {}) {
  const website = brandInfo.website || brandInfo.url || '';
  const name = brandInfo.name || '';
  const description = brandInfo.description || '';

  const defaults = [
    {
      connectorId: 'crm.hubspot',
      enabled: true,
      builtin: true,
      config: envConfig('HUBSPOT_API_KEY', 'apiKey'),
    },
    {
      connectorId: 'crm.salesforce',
      enabled: true,
      builtin: true,
      config: {
        ...envConfig('SALESFORCE_ACCESS_TOKEN', 'accessToken'),
        ...(process.env.SALESFORCE_INSTANCE_URL
          ? { instanceUrl: process.env.SALESFORCE_INSTANCE_URL }
          : {}),
      },
    },
    {
      connectorId: 'db.postgres',
      enabled: true,
      builtin: true,
      config: envConfig('DATABASE_URL', 'connectionString'),
    },
    {
      connectorId: 'db.mysql',
      enabled: true,
      builtin: true,
      config: envConfig('MYSQL_URL', 'connectionString'),
    },
    {
      connectorId: 'app.slack',
      enabled: true,
      builtin: true,
      config: envConfig('SLACK_BOT_TOKEN', 'botToken'),
    },
    {
      connectorId: 'app.notion',
      enabled: true,
      builtin: true,
      config: envConfig('NOTION_API_KEY', 'apiKey'),
    },
    {
      connectorId: 'app.google_sheets',
      enabled: true,
      builtin: true,
      config: process.env.GOOGLE_SHEETS_URL
        ? { sheetUrl: process.env.GOOGLE_SHEETS_URL }
        : {},
    },
    {
      connectorId: 'app.airtable',
      enabled: true,
      builtin: true,
      config: {
        ...envConfig('AIRTABLE_API_KEY', 'apiKey'),
        ...(process.env.AIRTABLE_BASE_ID ? { baseId: process.env.AIRTABLE_BASE_ID } : {}),
      },
    },
  ];

  if (website) {
    defaults.unshift({
      connectorId: 'marketing.website',
      enabled: true,
      builtin: true,
      config: { website, name, description },
    });
  }

  return defaults;
}

function envConfig(envKey, field) {
  const val = process.env[envKey];
  return val ? { [field]: val } : {};
}

/**
 * Merge built-in connectors with any optional user overrides (advanced).
 * Built-ins always win as the base — users never need to "connect" tools.
 */
function resolveActiveConnections(userConnections = [], brandInfo = {}) {
  const byId = new Map();
  for (const conn of builtinConnections(brandInfo)) {
    byId.set(conn.connectorId, conn);
  }
  for (const conn of userConnections || []) {
    if (!conn?.connectorId) continue;
    if (conn.enabled === false) {
      byId.delete(conn.connectorId);
      continue;
    }
    const base = byId.get(conn.connectorId) || { connectorId: conn.connectorId, enabled: true };
    byId.set(conn.connectorId, {
      ...base,
      ...conn,
      enabled: true,
      config: { ...(base.config || {}), ...(conn.config || {}) },
    });
  }
  return Array.from(byId.values());
}

/**
 * Aggregate MCP sources into a prompt-ready context block.
 */
async function gatherGenerationContext(connections = []) {
  const chunks = [];
  for (const conn of connections) {
    if (!conn?.enabled && conn?.enabled !== undefined) continue;
    const id = conn.connectorId;
    const config = conn.config || {};
    try {
      if (id === 'marketing.website' && (config.website || conn.website)) {
        const result = await invokeTool(id, 'research_brand', config, {
          website: config.website || conn.website,
          name: config.name,
          description: config.description,
        });
        chunks.push({
          source: id,
          protocol: 'Marketing Context Protocol',
          summary: result.data?.mcp?.summary,
          brandInfo: result.data?.brandInfo,
        });
        continue;
      }
      if (id.startsWith('crm.')) {
        const result = await invokeTool(id, 'crm_summary', config);
        chunks.push({ source: id, protocol: 'Model Context Protocol', summary: result.data.summary, details: result.data });
        continue;
      }
      if (id.startsWith('db.')) {
        const result = await invokeTool(id, 'db_summary', config);
        chunks.push({ source: id, protocol: 'Model Context Protocol', summary: result.data.summary, details: result.data });
        continue;
      }
      if (id === 'data.csv_url' || id === 'app.airtable') {
        const result = await invokeTool(id, 'data_summary', config);
        chunks.push({ source: id, protocol: 'Model Context Protocol', summary: result.data.summary, details: result.data });
        continue;
      }
      if (id.startsWith('app.')) {
        const result = await invokeTool(id, 'app_summary', config);
        chunks.push({ source: id, protocol: 'Model Context Protocol', summary: result.data.summary, details: result.data });
      }
    } catch (err) {
      chunks.push({ source: id, protocol: 'Model Context Protocol', summary: `Skipped ${id}: ${err.message}`, error: true });
    }
  }
  return chunks;
}

function contextToPromptBlock(chunks = []) {
  if (!chunks.length) return '';
  const lines = chunks
    .filter((c) => c.summary)
    .map((c) => `- [${c.protocol}] ${c.source}: ${c.summary}`);
  if (!lines.length) return '';
  return `\nEXTERNAL CONTEXT (Marketing Context Protocol + Model Context Protocol):\n${lines.join('\n')}\nUse this context to stay factual and on-brand.\n`;
}

module.exports = {
  CATALOG,
  catalogById,
  invokeTool,
  builtinConnections,
  resolveActiveConnections,
  gatherGenerationContext,
  contextToPromptBlock,
};
