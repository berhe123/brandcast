const {
  CATALOG,
  catalogById,
  invokeTool,
  gatherGenerationContext,
  contextToPromptBlock,
  resolveActiveConnections,
  builtinConnections,
} = require('../services/modelContextProtocol');
const { integrations } = require('../db/store');

const listCatalog = (req, res) => {
  res.json({
    success: true,
    data: {
      mode: 'built-in',
      message: 'MCP connectors are active by default. No manual Integrations page required.',
      protocols: [
        {
          id: 'marketing-context-protocol',
          name: 'Marketing Context Protocol',
          description: 'Brand and company research from websites for on-brand marketing content.',
        },
        {
          id: 'model-context-protocol',
          name: 'Model Context Protocol',
          description: 'Connect AI to external tools, databases, data sources, apps, and CRMs.',
        },
      ],
      connectors: CATALOG,
      builtin: builtinConnections({}),
    },
  });
};

const listConnections = (req, res) => {
  const saved = integrations.filter((i) => i.userId === req.user.id);
  const active = resolveActiveConnections(saved, {}).map((i) => ({
    ...i,
    meta: catalogById[i.connectorId] || null,
    config: sanitizeConfig(i.config),
  }));
  res.json({ success: true, data: active });
};

function sanitizeConfig(config = {}) {
  const out = { ...config };
  for (const key of Object.keys(out)) {
    if (/token|secret|password|key|connectionstring/i.test(key) && out[key]) {
      out[key] = '••••••••';
      out[`${key}Set`] = true;
    }
  }
  return out;
}

const connect = (req, res, next) => {
  try {
    const { connectorId, config, label, enabled = true } = req.body || {};
    const meta = catalogById[connectorId];
    if (!meta) return res.status(404).json({ success: false, error: 'Unknown connector' });

    const existing = integrations.find(
      (i) => i.userId === req.user.id && i.connectorId === connectorId
    );

    const record = {
      userId: req.user.id,
      connectorId,
      label: label || meta.name,
      protocol: meta.protocol,
      category: meta.category,
      enabled: enabled !== false,
      config: config || {},
      status: 'connected',
      connectedAt: new Date().toISOString(),
    };

    let saved;
    if (existing) {
      saved = integrations.update(existing.id, record);
    } else {
      saved = integrations.insert(record);
    }

    res.json({
      success: true,
      data: { ...saved, config: sanitizeConfig(saved.config), meta },
    });
  } catch (err) {
    next(err);
  }
};

const disconnect = (req, res) => {
  const item = integrations.find((i) => i.id === req.params.id);
  if (!item || item.userId !== req.user.id) {
    return res.status(404).json({ success: false, error: 'Connection not found' });
  }
  integrations.remove(item.id);
  res.json({ success: true, message: 'Disconnected' });
};

const invoke = async (req, res, next) => {
  try {
    const { connectorId, tool, input, connectionId } = req.body || {};
    if (!connectorId || !tool) {
      return res.status(400).json({ success: false, error: 'connectorId and tool are required' });
    }

    let config = {};
    const builtin = builtinConnections({}).find((c) => c.connectorId === connectorId);
    if (builtin) config = { ...builtin.config };

    if (connectionId) {
      const conn = integrations.find((i) => i.id === connectionId && i.userId === req.user.id);
      if (!conn) return res.status(404).json({ success: false, error: 'Connection not found' });
      config = { ...config, ...(conn.config || {}) };
    } else {
      const conn = integrations.find((i) => i.userId === req.user.id && i.connectorId === connectorId);
      if (conn) config = { ...config, ...(conn.config || {}) };
      if (req.body.config) config = { ...config, ...req.body.config };
    }

    const result = await invokeTool(connectorId, tool, config, input || {});
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const gatherContext = async (req, res, next) => {
  try {
    const website = req.query.website || '';
    const name = req.query.name || '';
    const brandInfo = { website, name };
    const saved = integrations.filter((i) => i.userId === req.user.id);
    const active = resolveActiveConnections(saved, brandInfo);
    const chunks = await gatherGenerationContext(active);
    res.json({
      success: true,
      data: {
        builtIn: true,
        chunks,
        promptBlock: contextToPromptBlock(chunks),
        connectionCount: active.length,
        sources: active.map((c) => c.connectorId),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCatalog,
  listConnections,
  connect,
  disconnect,
  invoke,
  gatherContext,
};
