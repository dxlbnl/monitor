#!/bin/sh

echo "[`date`] Writing values"
echo "*:*:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD" > ~/.pgpass
chmod 0600 ~/.pgpass

psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER << EOF
INSERT INTO conditions(time, location, temperature, humidity)
  VALUES (NOW(), 'cron', 70.0, 50.0);
EOF
