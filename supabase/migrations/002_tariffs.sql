-- ──────────────────────────────────────────────────────────────────────────────
-- 002_tariffs.sql — Grilles tarifaires Brain E-Log
-- ──────────────────────────────────────────────────────────────────────────────

-- Groupes tarifaires (Standard, Pâquerettes, etc.)
CREATE TABLE IF NOT EXISTS tariff_groups (
  id           TEXT PRIMARY KEY,
  name         TEXT        NOT NULL,
  description  TEXT,
  base_group_id TEXT       REFERENCES tariff_groups(id),
  is_default   BOOLEAN     NOT NULL DEFAULT false,
  is_archived  BOOLEAN     NOT NULL DEFAULT false,
  is_locked    BOOLEAN     NOT NULL DEFAULT false,
  used_count   INTEGER     NOT NULL DEFAULT 0,
  created_at   TEXT        NOT NULL,
  updated_at   TEXT        NOT NULL
);

-- Items tarifaires (prix par groupe)
CREATE TABLE IF NOT EXISTS tariff_items (
  id           TEXT PRIMARY KEY,
  group_id     TEXT        NOT NULL REFERENCES tariff_groups(id) ON DELETE CASCADE,
  category_id  TEXT        NOT NULL,
  label        TEXT        NOT NULL,
  description  TEXT,
  price        DECIMAL(12,4),
  price_type   TEXT        NOT NULL DEFAULT 'fixed',
  unit         TEXT        NOT NULL,
  billing      TEXT        NOT NULL,
  is_visible   BOOLEAN     NOT NULL DEFAULT true,
  condition    TEXT,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  notes        TEXT
);

-- Snapshots historique des prix (items stockés en JSONB)
CREATE TABLE IF NOT EXISTS tariff_snapshots (
  id         TEXT        PRIMARY KEY,
  group_id   TEXT        NOT NULL REFERENCES tariff_groups(id) ON DELETE CASCADE,
  label      TEXT        NOT NULL,
  items      JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance
CREATE INDEX IF NOT EXISTS tariff_items_group_id_idx ON tariff_items(group_id);
CREATE INDEX IF NOT EXISTS tariff_snapshots_group_id_idx ON tariff_snapshots(group_id);

-- RLS activé — politique permissive (admin interne, pas d'auth public pour l'instant)
ALTER TABLE tariff_groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tariff_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tariff_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tariff_groups_all"    ON tariff_groups    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tariff_items_all"     ON tariff_items     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tariff_snapshots_all" ON tariff_snapshots FOR ALL USING (true) WITH CHECK (true);
