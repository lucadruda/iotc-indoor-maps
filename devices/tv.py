from iotc import IOTCConnectType, IOTCEvents, Storage, CredentialsCache
from iotc.aio import IoTCClient
import asyncio
from json import loads, dumps
from sys import argv, exit
from random import randint

from iotc.models import Command


class FileStorage(Storage):
    def __init__(self, id):
        self._id = id

    def retrieve(self):
        f = open("creds.json", "r")
        self._creds: dict = loads(f.read())
        if self._id in self._creds:
            print("Retrieved credentials")
            return CredentialsCache.from_dict(self._creds.get(self._id))
        return None

    def persist(self, credentials: CredentialsCache):
        if credentials.device_id not in self._creds or (
            self._creds[credentials.device_id]["hub_name"] != credentials.hub_name
            and self._creds[credentials.device_id]["device_key"]
        ):
            self._creds[credentials.device_id] = credentials.todict()
            f = open("creds.json", "w")
            f.write(dumps(self._creds))
            f.close()


async def main():
    id = argv[1]
    client = IoTCClient(
        id,
        "0ne003B752D",
        IOTCConnectType.IOTC_CONNECT_SYMM_KEY,
        "AaiYjS3idInb4G9ZoWsz3WjEIEINguqo27l9IgYffLZ5DcyoKBJaExtCEOGGDgEvGn2eBaXsdy194SaHTQqAXw==",
        storage=FileStorage(id),
    )

    async def on_commands(command: Command):
        await command.reply()
        if command.name == "powerOff":
            await client.send_telemetry({"powerState": 0})
            exit(0)

    client.on(IOTCEvents.IOTC_COMMAND, on_commands)

    await client.connect()
    print("Client connected")
    await client.send_property({"ipAddress": f"192.168.1.{randint(1,254)}"})
    while client.is_connected():
        await client.send_telemetry({"powerState": 1})
        await asyncio.sleep(20)


asyncio.run(main())
