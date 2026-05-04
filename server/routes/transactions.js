const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/transactions
// @desc    Get user transactions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Placeholder: Return empty list or mock data
    res.json([]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
