#!/bin/bash

#!/bin/bash
shopt -s expand_aliases

alias psql="psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER"

psql << EOF
CREATE TABLE IF NOT EXISTS python_config (
  name        TEXT              NOT NULL,
  host        TEXT              NOT NULL
);

CREATE TABLE IF NOT EXISTS python_values (
  time        TIMESTAMPTZ       NOT NULL,
  name        TEXT              NOT NULL,
  status_code smallint          NOT NULL,
  response    JSONB             NULL
);

SELECT create_hypertable('python_values', 'time');
EOF


supervisord