#!/bin/bash

shopt -s expand_aliases

alias psql="psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER"

# Write the password file for postgres
echo "*:*:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD" > ~/.pgpass
chmod 0600 ~/.pgpass

cat /app/sql/*.sql | psql

echo "Starting script"
python3 main.py