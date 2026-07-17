const express = require('express');
const router = express.Router();
const {
  listCatalog,
  listConnections,
  connect,
  disconnect,
  invoke,
  gatherContext,
} = require('../controllers/mcpController');
const { requireAuth } = require('../middleware/auth');

router.get('/catalog', requireAuth, listCatalog);
router.get('/connections', requireAuth, listConnections);
router.post('/connect', requireAuth, connect);
router.delete('/connections/:id', requireAuth, disconnect);
router.post('/invoke', requireAuth, invoke);
router.get('/context', requireAuth, gatherContext);

module.exports = router;
