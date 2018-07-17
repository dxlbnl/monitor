# Plain and simple monitoring "stack".

- Driven by [PostgreSQL]
- In cooperation with TimescaleDB
- Supported by hasura
- Produced by Dexter

## Todo

- Everything

## Services

- Dashboard & Admin panel (frontend)
  - 
- graphql-engine  (powered by hasura)
- PostgreSQL with TimescaleDB extension enabled
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
