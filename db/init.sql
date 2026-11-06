CREATE TABLE IF NOT EXISTS panic_alerts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  photo TEXT,
  report TEXT,
  tipo TEXT DEFAULT 'outro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_panic_alerts_created_at ON panic_alerts (created_at DESC);
