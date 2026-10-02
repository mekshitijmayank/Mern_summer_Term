const express = require('express');
const { getAgents, getAgent } = require('../controllers/agent.controller');

const router = express.Router();

router.get('/', getAgents);
router.get('/:id', getAgent);

module.exports = router;
