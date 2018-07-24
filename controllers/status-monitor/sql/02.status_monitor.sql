CREATE OR REPLACE VIEW public."status_monitor" AS 
 SELECT c.*,
    u.uptime_past_hour,
    u.uptime_past_day,
    u.uptime_past_week,
    u.uptime_past_month,
    u.uptime_total,
    ( SELECT status_monitor_values."time"
       FROM status_monitor_values
      WHERE (c.id = status_monitor_values.monitor)
      ORDER BY status_monitor_values."time" DESC
     LIMIT 1) AS last_update
   FROM (status_monitor_config c
     JOIN status_monitor_uptime u ON ((u.id = c.id)))
;