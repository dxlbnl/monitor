# Plain and simple monitoring "stack".

- Driven by [PostgreSQL]
- In cooperation with [TimescaleDB]
- Supported by [hasura]
- Produced by Dexter

## Todo

- Everything

### DB setup

```sql
\c monitor
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- We start by creating a regular SQL table

CREATE TABLE conditions (
  time        TIMESTAMPTZ       NOT NULL,
  location    TEXT              NOT NULL,
  temperature DOUBLE PRECISION  NULL,
  humidity    DOUBLE PRECISION  NULL
);

-- This creates a hypertable that is partitioned by time
--   using the values in the `time` column.

SELECT create_hypertable('conditions', 'time');

```

## Services

- Dashboard & Admin panel (frontend)
  - 
- graphql-engine  (powered by [hasura])
- [PostgreSQL] with [TimescaleDB] extension enabled
- Controllers
  - a docker image, registering itself.
  - able to handle a variety of tasks.

## Controllers

A service aimed to do one thing, they should be small
They subscribe to a queue, and process tasks
The tasks also include critical components of the monitor itself, that's why they should leave health checks.

An example is the cron service, it reads it's configuration table and dispatches tasks on target queues.
It could dispatch a curl command to fetch a health status endpoint

## Features

- [ ] Health endpoint checking
- [ ] Negative checking
- [ ] dns routing
- [ ] ssl check
  - Á la ssllabs
- [ ] port scan
- [ ] mtr
- [ ] ctl met filter op geissuede certs
- [ ] mail blacklist checking


[PostgreSQL]: https://www.postgresql.org/
[TimescaleDB]: https://github.com/timescale/timescaledb/
[hasura]: https://hasura.io/
