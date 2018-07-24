
CREATE TABLE IF NOT EXISTS status_monitor_config (
  id          SERIAL            PRIMARY KEY,
  name        TEXT              NOT NULL,
  url         TEXT              NOT NULL
);

CREATE TABLE IF NOT EXISTS status_monitor_values (
  monitor     INTEGER           REFERENCES status_monitor_config(id),
  time        TIMESTAMPTZ       NOT NULL,
  status_code smallint          NOT NULL,
  response    JSONB             NULL
);

SELECT create_hypertable('status_monitor_values', 'time');

