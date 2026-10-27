-- One row per question. No IP addresses are stored.
CREATE TABLE IF NOT EXISTS asks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  question TEXT NOT NULL,
  role TEXT, title TEXT, company TEXT, depth INTEGER,
  sources TEXT,
  model TEXT,
  verified INTEGER, escalated INTEGER, fallback INTEGER,
  bad_numbers TEXT,
  latency_ms INTEGER,
  country TEXT
);
CREATE INDEX IF NOT EXISTS asks_ts ON asks (ts);
