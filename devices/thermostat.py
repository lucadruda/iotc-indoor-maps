from iotc import IOTCConnectType, IOTCEvents, Storage, CredentialsCache
from iotc.aio import IoTCClient
import asyncio
from json import loads, dumps
from sys import argv
from random import randint


class FileStorage(Storage):
    def __init__(self, id):
        self._id = id

    def retrieve(self):
        f = open("creds.json", "r")
        self._creds = loads(f.read())
        if self._id in self._creds:
            print("Retrieved credentials")
            return CredentialsCache.from_dict(self._creds[self._id])
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
    global temperature
    temperature = 25
    client = IoTCClient(
        id,
        "0ne003B752D",
        IOTCConnectType.IOTC_CONNECT_SYMM_KEY,
        "AaiYjS3idInb4G9ZoWsz3WjEIEINguqo27l9IgYffLZ5DcyoKBJaExtCEOGGDgEvGn2eBaXsdy194SaHTQqAXw==",
        storage=FileStorage(id),
    )

    async def on_props(prop_name, prop_value, comp_name):
        global temperature
        if prop_name == "targetTemperature":
            print(f"Received new temperature {prop_value}.")
            temperature = prop_value
        return True

    client.on(IOTCEvents.IOTC_PROPERTIES, on_props)

    await client.connect()
    print("Client connected")
    # await client.send_property({"ipAddress": f"192.168.1.{randint(1,254)}"})
    while client.is_connected():
        await client.send_telemetry({"temperature": temperature})
        await asyncio.sleep(10)


asyncio.run(main())
