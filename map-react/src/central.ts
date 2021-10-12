import axios from "axios";
import { Device, IoTCDevice } from "./types";

const APP_NAME = "ubsmap";
const DOMAIN = "azureiotcentral.com";
const API_VERSION = "1.0";
const API_KEY =
  "SharedAccessSignature sr=3a5279fe-8817-4181-af6d-27323aa9e6d1&sig=RP1WYdta%2F8kFSHZ3pf7Cu2Gruoa07Gp2ye8rBwpYhmY%3D&skn=API&se=1665043186510";
const TV_MODEL = "dtmi:modelDefinition:ndexursjf:eie12urydm";
const THM_MODEL = "dtmi:modelDefinition:frfn3tauo:xwmfyixfc5";

export async function getDevices() {
  const res: {
    tv: Device[];
    thermostats: Device[];
  } = {
    tv: [],
    thermostats: [],
  };
  const devs = await axios.get<{ value: IoTCDevice[] }>(
    `https://${APP_NAME}.${DOMAIN}/api/devices?api-version=${API_VERSION}`,
    {
      method: "GET",
      headers: {
        Authorization: API_KEY,
      },
    }
  );
  if ([200, 201].includes(devs.status)) {
    res.tv = devs.data.value.filter((d) => d.template === TV_MODEL);
    res.thermostats = devs.data.value.filter(
      (d: any) => d.template === THM_MODEL
    );
    res.tv = await Promise.all(
      res.tv.map(async (tv) => {
        delete tv.etag;
        tv.properties = await getDeviceProperties(tv.id);
        return tv;
      })
    );
    res.thermostats = await Promise.all(
      res.thermostats.map(async (thm) => {
        delete thm.etag;
        thm.properties = await getDeviceProperties(thm.id);
        return thm;
      })
    );
  }
  return res;
}

export async function getDeviceProperties(deviceId: string) {
  const props = await axios.get<{ [propId: string]: any }>(
    `https://${APP_NAME}.${DOMAIN}/api/devices/${deviceId}/properties?api-version=${API_VERSION}`,
    {
      headers: {
        Authorization: API_KEY,
      },
    }
  );
  if ([200, 201].includes(props.status)) {
    return props.data;
  }
  return {};
}

export async function getTelemetryValue(
  deviceId: string,
  telemetryName: string
) {
  const res = await axios.get<{
    value: any;
  }>(
    `https://${APP_NAME}.${DOMAIN}/api/devices/${deviceId}/telemetry/${telemetryName}?api-version=${API_VERSION}`,
    {
      headers: {
        Authorization: API_KEY,
      },
    }
  );
  if ([200, 201].includes(res.status)) {
    return res.data.value;
  }
  return null;
}

export async function triggerCommand(
  deviceId: string,
  commandName: string,
  commandPayload?: any
) {
  const res = await axios.post<{}>(
    `https://${APP_NAME}.${DOMAIN}/api/devices/${deviceId}/commands/${commandName}?api-version=${API_VERSION}`,
    commandPayload ?? {}
  );
  if ([200, 201].includes(res.status)) {
    return true;
  }
  return null;
}
