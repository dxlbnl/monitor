CREATE OR REPLACE VIEW public."status_monitor_uptime" AS 

 WITH statusses as (
    SELECT monitor, time,
        CASE status_code
            WHEN 200 THEN 1
            ELSE 0
        END AS is_up
    FROM status_monitor_values
), uptime_past_hour as (
    SELECT
        monitor,
        ceil((((sum(is_up))::numeric / (count(*))::numeric) * (1000)::numeric)) / 10.0 AS uptime
    FROM statusses
    WHERE time > NOW() - interval '1 hour'
    GROUP by monitor
), uptime_past_day as (
    SELECT
        monitor,
        ceil((((sum(is_up))::numeric / (count(*))::numeric) * (1000)::numeric)) / 10.0 AS uptime
    FROM statusses
    WHERE time > NOW() - interval '1 day'
    GROUP by monitor
), uptime_past_week as (
    SELECT
        monitor,
        ceil((((sum(is_up))::numeric / (count(*))::numeric) * (1000)::numeric)) / 10.0 AS uptime
    FROM statusses
    WHERE time > NOW() - interval '1 week'
    GROUP by monitor
), uptime_past_month as (
    SELECT
        monitor,
        ceil((((sum(is_up))::numeric / (count(*))::numeric) * (1000)::numeric)) / 10.0 AS uptime
    FROM statusses
    WHERE time > NOW() - interval '1 month'
    GROUP by monitor
), uptime_total as (
    SELECT
        monitor,
        ceil((((sum(is_up))::numeric / (count(*))::numeric) * (1000)::numeric)) / 10.0 AS uptime
    FROM statusses
    GROUP by monitor
)
SELECT
  c.id,
  ph.uptime AS uptime_past_hour,
  pd.uptime AS uptime_past_day,
  pw.uptime AS uptime_past_week,
  pm.uptime AS uptime_past_month,
  pt.uptime AS uptime_total
FROM status_monitor_config c
LEFT JOIN uptime_past_hour ph ON ph.monitor = c.id
LEFT JOIN uptime_past_day pd ON pd.monitor = c.id
LEFT JOIN uptime_past_week pw ON pw.monitor = c.id
LEFT JOIN uptime_past_month pm ON pm.monitor = c.id
LEFT JOIN uptime_total pt ON pt.monitor = c.id
;