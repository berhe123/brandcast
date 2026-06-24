/**
 * Tiny JSON-file data store
 * --------------------------
 * A zero-dependency persistence layer that keeps the whole dataset in memory and
 * writes through to a single JSON file. It exposes small repository helpers per
 * collection (users, content, scheduled, events).
 *
 * This is deliberately swappable: every caller goes through the repo functions
 * below, so moving to Postgres/Mongo later means reimplementing this one file —
 * no controller changes. Good enough for the demo; not meant for high concurrency.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, '../../.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const EMPTY = { users: [], content: [], scheduled: [], events: [] };

let db = null;
let saveTimer = null;

const load = () => {
  if (db) return db;
  try {
    if (fs.existsSync(DATA_FILE)) {
      db = { ...EMPTY, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
    } else {
      db = { ...EMPTY };
    }
  } catch (err) {
    console.warn('[store] could not read db.json, starting fresh:', err.message);
    db = { ...EMPTY };
  }
  return db;
};

const persist = () => {
  // Debounced write-through so a burst of mutations costs one disk write.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    } catch (err) {
      console.error('[store] failed to persist db.json:', err.message);
    }
  }, 120);
};

const id = () => crypto.randomUUID();

/** Generic collection accessor returning chainable-ish helpers. */
const collection = (name) => {
  load();
  return {
    all: () => db[name],
    find: (pred) => db[name].find(pred),
    filter: (pred) => db[name].filter(pred),
    insert: (doc) => {
      const record = { id: doc.id || id(), createdAt: doc.createdAt || new Date().toISOString(), ...doc };
      db[name].unshift(record);
      persist();
      return record;
    },
    update: (matchId, updates) => {
      const item = db[name].find((d) => d.id === matchId);
      if (!item) return null;
      Object.assign(item, updates, { updatedAt: new Date().toISOString() });
      persist();
      return item;
    },
    remove: (matchId) => {
      const before = db[name].length;
      db[name] = db[name].filter((d) => d.id !== matchId);
      const removed = db[name].length !== before;
      if (removed) persist();
      return removed;
    },
  };
};

module.exports = {
  users: collection('users'),
  content: collection('content'),
  scheduled: collection('scheduled'),
  events: collection('events'),
  newId: id,
  _DATA_FILE: DATA_FILE,
};
