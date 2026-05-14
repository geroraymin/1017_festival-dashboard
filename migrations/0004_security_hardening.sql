-- Security hardening support tables.

CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT 0,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_lookup
ON login_attempts(username, ip_address, success, attempted_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_cleanup
ON login_attempts(attempted_at);

