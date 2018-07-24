import asyncio
import aiopg
from asyncio.subprocess import PIPE, STDOUT 
import signal
import json
import sys
import traceback


dsn = 'dbname=monitor user=postgres password=mysecretpassword host=postgres'

def signal_handler(signal, frame):
    loop.stop()
    sys.exit(0)


# Listen to configuration changes
# mtr --report
# 
# -r, --report               output using report mode
# -c, --report-cycles COUNT  set the number of pings sent
# -j, --json                 output json
# -b, --show-ips             show IP numbers and host names

async def trace_host(host, cycles=10, interval=5):
    cmd = 'mtr -b -r -c {cycles} -j -i {interval} {host}'.format(host=host, cycles=cycles, interval=interval)
    # cmd = 'mtr -b -r -c {cycles} -j {host}'.format(host=host, cycles=cycles)

    print ("[INFO] Starting traceroute {}...".format(host))
    process = await asyncio.create_subprocess_shell(
        cmd,
        # stdin = PIPE,
        stdout = PIPE,
        stderr = PIPE
    )

    await process.wait()

    raw = await process.stdout.read()
    data = json.loads(raw)
    error = await process.stderr.read()
    if error:
        print("Got error", error)
    else:
        print("[INFO] Traceroute {} finished.".format(host))
        return data


async def monitor_config(conn):
    '''Reads config yields actions to setup monitors'''

    async with conn.cursor() as cur:
        await cur.execute("SELECT id, host, cycles, interval FROM mtr_config")
        async for row in cur:
            yield ('insert', *row)

        await cur.execute("LISTEN notify_config")

        while True:
            msg = await conn.notifies.get()
            if msg.payload == 'finish':
                return
            else:
                payload = json.loads(msg.payload)
                if payload.get('table') != 'mtr_config': continue

                data = payload.get('data')
                monitor_id = int(data.get('id'))

                yield (
                    payload.get('operation').lower(),
                    monitor_id,
                    data.get('host'),
                    data.get('cycles'),
                    data.get('interval')
                )


async def monitor_host(conn, monitor_id, host, cycles, interval):
    print("+ Starting monitor on {}".format(host))
    try:
        while True:
            trace = await trace_host(host, cycles, interval)

            report = trace.get('report')
            mtr = report.get('mtr')
            hubs = report.get('hubs')
            dest = hubs[-1]

            print('Got monitor:', mtr, dest)

            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO
                        mtr_values (host, time, tests, dest_avg, dest_best, dest_worst, dest_loss, hubs, mtr)
                    VALUES
                        (%(host)s, NOW(), %(tests)s, %(dest_avg)s, %(dest_best)s, %(dest_worst)s, %(dest_loss)s, %(hubs)s, %(mtr)s)
                    ;
                """, {
                    'host': monitor_id,
                    'tests': mtr.get('tests'),
                    'dest_avg': dest.get('Avg'),
                    'dest_best': dest.get('Best'),
                    'dest_worst': dest.get('Wrst'),
                    'dest_loss': dest.get('Loss%'),
                    'hubs': json.dumps(hubs),
                    'mtr': json.dumps(mtr)
                })
            print("Inserted")
    except:
        traceback.print_exc()
    print("- Stopping monitor on {}".format(host))


async def main():
    async with aiopg.create_pool(dsn) as pool:
        async with pool.acquire() as conn:
            monitors = {}
            async for (action, monitor_id, host, cycles, interval) in monitor_config(conn):
                print("action:", action, monitor_id, host, cycles, interval)
                print("monitors:", monitors)
                if action == 'insert':
                    monitors[monitor_id] = asyncio.ensure_future(monitor_host(conn, monitor_id, host, cycles, interval))
                elif action == 'update':
                    monitors[monitor_id].cancel()
                    monitors[monitor_id] = asyncio.ensure_future(monitor_host(conn, monitor_id, host, cycles, interval))
                elif action == 'delete':
                    monitors[monitor_id].cancel()
                    del monitors[monitor_id]

    print("ALL DONE")


print("Starting")


loop = asyncio.get_event_loop() 
signal.signal(signal.SIGINT, signal_handler)

# tasks = [loop.create_task(trace_host('dxlb.nl', cycles=1))]

# wait_tasks = asyncio.wait(tasks) 

try:
    loop.run_until_complete(main())
finally:
    loop.run_until_complete(loop.shutdown_asyncgens())  # see: https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.AbstractEventLoop.shutdown_asyncgens
    loop.close()

print("Done")