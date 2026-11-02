-- Identity database, first slice. Mirrors docs/dbschema.md (Identity database).
-- All access is through parameterised queries; this file holds no data.

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm text NOT NULL CHECK (realm IN ('public', 'staff')),
  email_normalized varchar(254) NOT NULL,
  display_name varchar(100) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  email_verified_at timestamptz,
  authz_version bigint NOT NULL DEFAULT 1 CHECK (authz_version >= 1),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  UNIQUE (realm, email_normalized)
);

CREATE TABLE password_credentials (
  account_id uuid PRIMARY KEY REFERENCES accounts (id) ON DELETE CASCADE,
  password_hash text NOT NULL CHECK (password_hash LIKE '$argon2id$%'),
  changed_at timestamptz NOT NULL DEFAULT now(),
  hash_policy_version int NOT NULL DEFAULT 1,
  must_change boolean NOT NULL DEFAULT false
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  realm text NOT NULL CHECK (realm IN ('public', 'staff')),
  session_digest bytea NOT NULL UNIQUE,
  family_id uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL,
  idle_expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  mfa_completed_at timestamptz,
  authz_version bigint NOT NULL,
  user_agent_summary varchar(80),
  ip_signal_digest bytea,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_account_idx ON sessions (account_id) WHERE revoked_at IS NULL;

-- Failed sign-ins, kept as keyed digests so the table never holds an email or an IP address.
CREATE TABLE login_attempts (
  id bigserial PRIMARY KEY,
  key_digest bytea NOT NULL,
  ip_digest bytea NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX login_attempts_key_idx ON login_attempts (key_digest, attempted_at);
CREATE INDEX login_attempts_ip_idx ON login_attempts (ip_digest, attempted_at);

-- Security events. Never store passwords, tokens or raw emails in detail.
CREATE TABLE audit_events (
  id bigserial PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  account_id uuid,
  event text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('success', 'failure', 'blocked')),
  ip_digest bytea,
  request_id text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX audit_events_account_idx ON audit_events (account_id, at);
