CREATE TABLE IF NOT EXISTS mtr_config (
  id          SERIAL           PRIMARY KEY,
  name        TEXT              NOT NULL,
  host        TEXT              NOT NULL,
  cycles      INTEGER           DEFAULT 10,
  interval    DECIMAL           DEFAULT 5
);
DROP TRIGGER IF EXISTS mtr_notify_config ON mtr_config;
CREATE TRIGGER mtr_notify_config AFTER INSERT OR UPDATE OR DELETE ON mtr_config
FOR EACH ROW EXECUTE PROCEDURE notify_config(
  'id',
  'host',
  'cycles',
  'interval'
);

CREATE TABLE IF NOT EXISTS mtr_values (
   host        INTEGER           REFERENCES mtr_config(id),
   time        TIMESTAMPTZ       NOT NULL,
   tests       INTEGER           NOT NULL,
   dest_avg    DECIMAL           NOT NULL,
   dest_best   DECIMAL           NOT NULL,
   dest_worst  DECIMAL           NOT NULL,
   dest_loss   DECIMAL           NOT NULL,
   hubs        JSON              NOT NULL,
   mtr         JSON              NOT NULL
);

-- SELECT create_hypertable('mtr_values', 'time');
