# Promise-to-Pay Tracker

## Problem
When a payment fails, customers often promise to pay later ("I'll pay by Friday").
Merchants have no system to track these promises, spot risky ones, or follow up
smartly — so money quietly gets lost.

## What this agent does
1. Tracks every payment promise through a clear state machine:
   `promised → paid` or `promised → broken → escalated`
2. Learns a real pattern from the data: promises without an exact date
   break more often than ones with a specific date
3. Escalates broken promises with a bounded, rule-based follow-up
   (max 3 attempts, 24-hour cooldown between messages) in Hinglish
4. Stops and flags for human follow-up after max attempts — never spams endlessly
5. Reports recovery numbers: total at risk, amount recovered, recovery rate

## Tech stack
Node.js, Express, MongoDB (Mongoose)

## API routes
- `POST /api/promises` — create a new promise
- `GET /api/promises` — list all promises
- `PATCH /api/promises/:id/pay` — mark a promise as paid
- `GET /api/promises/check-broken` — flip overdue promises to "broken"
- `GET /api/promises/pattern-stats` — break rate: exact-date vs vague promises
- `POST /api/promises/:id/escalate` — send a bounded escalation (with stopping rules)
- `GET /api/promises/report` — recovery summary (the demo numbers)

## Results (from test batch)
[Paste your actual numbers from /report here, e.g.:]
- Total promises: 10
- Recovered: 2 paid (₹5,800)
- At risk: 8 (₹22,900)
- Recovery rate: 20%
- Pattern insight: vague promises broke 100% of the time vs exact-date promises

## What makes this "bounded and safe"
- Max 3 escalation attempts per promise — then flagged for a human, never infinite retries
- 24-hour cooldown between messages — no spamming
- Every state change and escalation is saved in the database — full audit trail