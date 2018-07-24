import asyncio
import aiopg

dsn = 'dbname=monitor user=postgres password=mysecretpassword host=postgres'

async def notify(conn):
    async with conn.cursor() as cur:
        for i in range(5):
            msg = "message {}".format(i)
            print('Send ->', msg)
            await cur.execute("NOTIFY channel, %s", (msg,))

        await cur.execute("NOTIFY channel, 'finish'")


# Listen to configuration changes
async def listen(conn):
    async with conn.cursor() as cur:
        await cur.execute("LISTEN channel")
        while True:
            msg = await conn.notifies.get()
            if msg.payload == 'finish':
                return
            else:
                print('Receive <-', msg.payload)


async def main():
    async with aiopg.create_pool(dsn) as pool:
        async with pool.acquire() as conn1:
            listener = listen(conn1)
            async with pool.acquire() as conn2:
                notifier = notify(conn2)
                await asyncio.gather(listener, notifier)
    print("ALL DONE")


print("Starting")
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
print("Done")