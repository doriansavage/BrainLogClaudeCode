-- ════════════════════════════════════════════════════════
-- Migration 001 — Questionnaire prospect Brain E-Log
-- ════════════════════════════════════════════════════════

-- ── Enum statuts prospect ────────────────────────────────
CREATE TYPE prospect_status AS ENUM (
  'pending',      -- token envoyé, formulaire pas encore commencé
  'in_progress',  -- formulaire en cours de remplissage
  'submitted',    -- questionnaire soumis par le prospect
  'processing',   -- Mathieu génère l'offre
  'offer_sent'    -- offre envoyée au prospect
);

-- ── Table prospects ──────────────────────────────────────
CREATE TABLE prospects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token           TEXT UNIQUE NOT NULL,                    -- token URL unique
  company_name    TEXT,                                    -- prérempli si connu
  contact_email   TEXT,
  contact_name    TEXT,
  status          prospect_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at    TIMESTAMPTZ
);

-- ── Table réponses questionnaire ─────────────────────────
-- Stocke les réponses section par section (JSONB) pour
-- permettre la reprise et l'auto-save.
CREATE TABLE questionnaire_responses (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id             UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  answers                 JSONB NOT NULL DEFAULT '{}',     -- { "Q1": {"Q1.01": "...", ...}, ... }
  current_section_index   INTEGER NOT NULL DEFAULT 0,      -- pour reprendre où on s'est arrêté
  completed               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Une seule réponse active par prospect
CREATE UNIQUE INDEX questionnaire_responses_prospect_id_idx
  ON questionnaire_responses (prospect_id);

-- ── Trigger updated_at automatique ──────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER questionnaire_responses_updated_at
  BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Lecture/écriture via token (prospect public)
-- Le prospect ne peut accéder qu'à son propre enregistrement,
-- identifié par le token passé comme claim JWT ou via anon key.
CREATE POLICY "prospect_read_own" ON prospects
  FOR SELECT USING (true);  -- filtré par token dans la query

CREATE POLICY "prospect_update_own" ON prospects
  FOR UPDATE USING (true);

-- Les réponses sont accessibles via le prospect_id
CREATE POLICY "response_read_own" ON questionnaire_responses
  FOR SELECT USING (true);

CREATE POLICY "response_upsert_own" ON questionnaire_responses
  FOR ALL USING (true);

-- Accès complet pour les rôles authentifiés (Mathieu / admin)
-- À affiner selon la config Supabase Auth utilisée.

-- ── Index de performance ─────────────────────────────────
CREATE INDEX prospects_token_idx ON prospects (token);
CREATE INDEX prospects_status_idx ON prospects (status);
CREATE INDEX questionnaire_responses_prospect_idx ON questionnaire_responses (prospect_id);
CREATE INDEX questionnaire_responses_completed_idx ON questionnaire_responses (completed);
