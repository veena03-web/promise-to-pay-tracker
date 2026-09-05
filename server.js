require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('public'));
 // lets our server understand JSON data sent to it
 const promiseRoutes = require('./routes/promiseRoutes');
app.use('/api/promises', promiseRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// A simple test route to check the server is alive
app.get('/', (req, res) => {
  res.send('Promise-to-Pay Tracker API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});