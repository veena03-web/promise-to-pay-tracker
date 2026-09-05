const express = require('express');
const router = express.Router();
const Promise = require('../models/Promise');

// 1. CREATE a new promise
router.post('/', async (req, res) => {
  try {
    const { customerName, amount, promisedDate, hasExactDate } = req.body;
    const newPromise = new Promise({ customerName, amount, promisedDate, hasExactDate });
    await newPromise.save();
    res.status(201).json(newPromise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. GET all promises
router.get('/', async (req, res) => {
  const promises = await Promise.find();
  res.json(promises);
});

// 3. MARK a promise as paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const updated = await Promise.findByIdAndUpdate(
      req.params.id,
      { status: 'paid' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. CHECK for broken promises (past due date, not paid)
router.get('/check-broken', async (req, res) => {
  const today = new Date();
  const brokenPromises = await Promise.find({
    promisedDate: { $lt: today },
    status: 'promised'
  });

  // Mark them as broken
  for (const p of brokenPromises) {
    p.status = 'broken';
    await p.save();
  }

  res.json({ message: `${brokenPromises.length} promises marked broken`, brokenPromises });
});

// 5. Pattern check: break rate by promise type
router.get('/pattern-stats', async (req, res) => {
  const exactDatePromises = await Promise.find({ hasExactDate: true });
  const vaguePromises = await Promise.find({ hasExactDate: false });

  const calcBreakRate = (list) => {
    if (list.length === 0) return 0;
    const broken = list.filter(p => p.status === 'broken' || p.status === 'escalated').length;
    return ((broken / list.length) * 100).toFixed(1);
  };

  res.json({
    exactDate: {
      total: exactDatePromises.length,
      breakRatePercent: calcBreakRate(exactDatePromises)
    },
    vague: {
      total: vaguePromises.length,
      breakRatePercent: calcBreakRate(vaguePromises)
    },
    insight: `Vague promises break ${calcBreakRate(vaguePromises)}% of the time vs ${calcBreakRate(exactDatePromises)}% for exact-date promises`
  });
});

// 6. Escalate a broken promise (bounded recovery action)
router.post('/:id/escalate', async (req, res) => {
  try {
    const promise = await Promise.findById(req.params.id);
    if (!promise) return res.status(404).json({ error: 'Promise not found' });

    const MAX_ATTEMPTS = 3;
    const COOLDOWN_HOURS = 24; // ~36 seconds, for testing only

    // Stopping rule 1: already escalated too many times
    if (promise.escalationCount >= MAX_ATTEMPTS) {
      return res.json({
        message: 'Max escalation attempts reached. Flagging for human follow-up.',
        promise
      });
    }

    // Stopping rule 2: too soon since last message
    if (promise.lastEscalatedAt) {
      const hoursSinceLast = (new Date() - promise.lastEscalatedAt) / (1000 * 60 * 60);
      if (hoursSinceLast < COOLDOWN_HOURS) {
        return res.json({
          message: `Cooldown active. Wait ${(COOLDOWN_HOURS - hoursSinceLast).toFixed(1)} more hours.`,
          promise
        });
      }
    }

    // Build the escalation message (Hinglish style)
    const message = `Namaste ${promise.customerName}, aapka payment of ₹${promise.amount} abhi tak pending hai. Kripya jaldi pay kar dijiye. Attempt #${promise.escalationCount + 1}`;

    // Update record
    promise.status = 'escalated';
    promise.escalationCount += 1;
    promise.lastEscalatedAt = new Date();
    await promise.save();

    res.json({ message: 'Escalation sent', sentText: message, promise });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Recovery report - the demo summary
router.get('/report', async (req, res) => {
  const all = await Promise.find();

  const total = all.length;
  const paid = all.filter(p => p.status === 'paid');
  const broken = all.filter(p => p.status === 'broken');
  const escalated = all.filter(p => p.status === 'escalated');
  const stillPending = all.filter(p => p.status === 'promised');

  const totalAmount = all.reduce((sum, p) => sum + p.amount, 0);
  const recoveredAmount = paid.reduce((sum, p) => sum + p.amount, 0);
  const atRiskAmount = [...broken, ...escalated].reduce((sum, p) => sum + p.amount, 0);

  res.json({
    totalPromises: total,
    paid: paid.length,
    broken: broken.length,
    escalated: escalated.length,
    stillPending: stillPending.length,
    totalAmount,
    recoveredAmount,
    atRiskAmount,
    recoveryRatePercent: total > 0 ? ((paid.length / total) * 100).toFixed(1) : 0
  });
});

module.exports = router;