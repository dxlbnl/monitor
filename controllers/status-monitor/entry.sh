#!/bin/sh

# Write the password file for postgres
echo "*:*:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD" > ~/.pgpass
chmod 0600 ~/.pgpass

alias psql="psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER"

psql << EOF
CREATE TABLE IF NOT EXISTS status_monitor_config (
  name        TEXT              NOT NULL,
  url         TEXT              NOT NULL
);

CREATE TABLE IF NOT EXISTS status_monitor_values (
  time        TIMESTAMPTZ       NOT NULL,
  name        TEXT              NOT NULL,
  status_code smallint          NOT NULL,
  response    JSONB             NULL
);

SELECT create_hypertable('status_monitor_values', 'time');
EOF

echo "Starting cron"
/usr/sbin/crond -f -l 8