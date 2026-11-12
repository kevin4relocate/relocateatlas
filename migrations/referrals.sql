CREATE TABLE IF NOT EXISTS referral_links (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS referral_clicks (
  slug TEXT NOT NULL REFERENCES referral_links(slug),
  day TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('linkedin', 'facebook', 'website', 'other')),
  clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  PRIMARY KEY (slug, day, source)
);
