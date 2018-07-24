#!/bin/bash
shopt -s expand_aliases

alias psql="psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER"

# Not see spaces as field separators
SAVEIFS=$IFS
IFS=$(echo -en "\n\b")

# Read configuration table
hosts=$(psql -t -c '
  SELECT row_to_json(c) FROM (
    SELECT id, url FROM status_monitor_config
  ) c' | jq -c '.'
)

echo $hosts



# For every configured host, curl it and write the status and if json the json result
for host in ${hosts}; do
  echo "Checking $host"
  id=$(echo $host | jq -r .id)
  url=$(echo $host | jq -r .url)

  echo "Checking $id($url)"
  echo $(curl -L $url)

  status=$(curl -L -s -o /dev/null -w "%{http_code}" $url)

  echo "Checked host($id) on $url -> $status"

  psql -c "INSERT INTO status_monitor_values(time, monitor, status_code) VALUES (NOW(), '$id', $status);"
  
done
IFS=$SAVEIFS

