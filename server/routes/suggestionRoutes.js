const express = require('express');
const router = express.Router();
const { getSuggestion } = require('../controllers/suggestionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSuggestion); 

module.exports = router;