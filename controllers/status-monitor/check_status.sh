#!/bin/bash
shopt -s expand_aliases

alias psql="psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER"

# Read configuration table
hosts=$(psql -t -c '
  SELECT row_to_json(c) FROM (
    SELECT * FROM status_monitor_config
  ) c'
)

# For every configured host, curl it and write the status and if json the json result
for host in ${hosts}; do
  name=$(echo $host | jq -r .name)
  url=$(echo $host | jq -r .url)
  status=$(curl -L -s -o /dev/null -w "%{http_code}" $url)

  echo "Checked host($name) on $url -> $status"

  psql -c "INSERT INTO status_monitor_values(time, name, status_code) VALUES (NOW(), '$name', $status);"
  
done

