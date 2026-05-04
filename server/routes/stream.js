const express = require('express');
const router = express.Router();

// @route   GET api/stream
// @desc    Stream endpoint (placeholder)
// @access  Public
router.get('/', (req, res) => {
  res.send('Stream endpoint active');
});

module.exports = router;
