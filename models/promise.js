const mongoose = require('mongoose');

const promiseSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  promisedDate: {
    type: Date,
    required: true
  },
  hasExactDate: {
    type: Boolean,
    default: true // false if promise was vague, like "soon" instead of a real date
  },
  status: {
    type: String,
    enum: ['pending', 'promised', 'paid', 'broken', 'escalated'],
    default: 'promised'
  },
    escalationCount: {
    type: Number,
    default: 0
  },
  lastEscalatedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Promise', promiseSchema);