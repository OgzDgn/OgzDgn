CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed')),
  week INTEGER NOT NULL DEFAULT 1 CHECK (week >= 1),
  max_weeks INTEGER NOT NULL DEFAULT 24 CHECK (max_weeks >= 1),
  active_crisis TEXT NOT NULL DEFAULT 'Dengeli Piyasa',
  coop_fund NUMERIC(16, 2) NOT NULL DEFAULT 180000,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY,
  room_key TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_key, season_id)
);

CREATE TABLE IF NOT EXISTS player_season_states (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
  cash NUMERIC(16, 2) NOT NULL DEFAULT 900000,
  debt NUMERIC(16, 2) NOT NULL DEFAULT 300000,
  shipments INTEGER NOT NULL DEFAULT 0,
  failed_shipments INTEGER NOT NULL DEFAULT 0,
  online BOOLEAN NOT NULL DEFAULT FALSE,
  anti_cheat_score INTEGER NOT NULL DEFAULT 0,
  last_action_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, season_id)
);

CREATE TABLE IF NOT EXISTS room_events (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anti_cheat_flags (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  severity SMALLINT NOT NULL DEFAULT 1,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_room_key_season ON rooms (room_key, season_id);
CREATE INDEX IF NOT EXISTS idx_player_state_room_season ON player_season_states (room_id, season_id);
CREATE INDEX IF NOT EXISTS idx_player_state_user_season ON player_season_states (user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_room_events_room_created ON room_events (room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_user_created ON anti_cheat_flags (user_id, created_at DESC);
