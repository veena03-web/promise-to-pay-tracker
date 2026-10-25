require('dotenv').config();
const mongoose = require('mongoose');
const Promise = require('./models/promise');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');
  await Promise.deleteMany({}); // clears old test data so we start fresh

  const records = [
    { customerName: 'Ravi Kumar', amount: 1500, promisedDate: '2026-09-06', hasExactDate: true, status: 'promised' },
    { customerName: 'Anita Sharma', amount: 3000, promisedDate: '2026-09-01', hasExactDate: false, status: 'promised' },
    { customerName: 'Vikram Singh', amount: 2200, promisedDate: '2026-08-30', hasExactDate: true, status: 'promised' },
    { customerName: 'Priya Nair', amount: 800, promisedDate: '2026-09-10', hasExactDate: true, status: 'promised' },
    { customerName: 'Suresh Reddy', amount: 5000, promisedDate: '2026-08-28', hasExactDate: false, status: 'promised' },
    { customerName: 'Kavya Iyer', amount: 1200, promisedDate: '2026-09-02', hasExactDate: false, status: 'promised' },
    { customerName: 'Arjun Mehta', amount: 4000, promisedDate: '2026-08-29', hasExactDate: true, status: 'paid' },
    { customerName: 'Deepa Rao', amount: 1800, promisedDate: '2026-09-03', hasExactDate: true, status: 'paid' },
    { customerName: 'Manoj Pillai', amount: 2500, promisedDate: '2026-08-27', hasExactDate: false, status: 'promised' },
    { customerName: 'Neha Joshi', amount: 900, promisedDate: '2026-09-08', hasExactDate: true, status: 'promised' }
  ];

  await Promise.insertMany(records);
  console.log(`✅ Inserted ${records.length} test records`);
  mongoose.disconnect();
}

seed();