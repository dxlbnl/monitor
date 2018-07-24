#!/bin/sh

# Write the password file for postgres
echo "*:*:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD" > ~/.pgpass
chmod 0600 ~/.pgpass

alias psql="psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER"

cat /root/sql/*.sql | psql

echo "Starting cron"
/usr/sbin/crond -f -l 8