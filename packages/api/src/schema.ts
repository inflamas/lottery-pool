/** SQLite schema. Money columns end in `_cents` and hold whole cents. */
export const schema = `
CREATE TABLE IF NOT EXISTS pools (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS members (
  id           INTEGER PRIMARY KEY,
  pool_id      INTEGER NOT NULL REFERENCES pools(id),
  name         TEXT NOT NULL,
  shares       INTEGER NOT NULL CHECK (shares > 0),
  is_organizer INTEGER NOT NULL DEFAULT 0 CHECK (is_organizer IN (0, 1))
) STRICT;

CREATE TABLE IF NOT EXISTS tickets (
  id      INTEGER PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id)
) STRICT;

CREATE TABLE IF NOT EXISTS ticket_numbers (
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  number    INTEGER NOT NULL CHECK (number BETWEEN 1 AND 38),
  PRIMARY KEY (ticket_id, number)
) STRICT;

CREATE TABLE IF NOT EXISTS draws (
  id        INTEGER PRIMARY KEY,
  pool_id   INTEGER NOT NULL REFERENCES pools(id),
  drawn_on  TEXT NOT NULL,
  win_cents INTEGER NOT NULL CHECK (win_cents >= 0)
) STRICT;

CREATE TABLE IF NOT EXISTS draw_numbers (
  draw_id INTEGER NOT NULL REFERENCES draws(id),
  number  INTEGER NOT NULL CHECK (number BETWEEN 1 AND 38),
  PRIMARY KEY (draw_id, number)
) STRICT;
`;
