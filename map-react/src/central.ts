import axios from "axios";
import { Device, IoTCDevice } from "./types";
import { API_KEY, API_VERSION, APP_URL } from "./common";
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
    `https://${APP_URL}/api/devices?api-version=${API_VERSION}`,
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
    `https://${APP_URL}/api/devices/${deviceId}/properties?api-version=${API_VERSION}`,
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
    `https://${APP_URL}/api/devices/${deviceId}/telemetry/${telemetryName}?api-version=${API_VERSION}`,
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
    `https://${APP_URL}/api/devices/${deviceId}/commands/${commandName}?api-version=${API_VERSION}`,
    commandPayload ?? {},
    {
      headers: {
        Authorization: API_KEY,
      },
    }
  );
  if ([200, 201].includes(res.status)) {
    return true;
  }
  return null;
}

export async function setProperty(
  deviceId: string,
  propertyName: string,
  propertyValue: any
) {
  const res = await axios.patch<{}>(
    `https://${APP_URL}/api/devices/${deviceId}/properties?api-version=${API_VERSION}`,
    { [propertyName]: propertyValue },
    {
      headers: {
        Authorization: API_KEY,
      },
    }
  );
  if ([200, 201].includes(res.status)) {
    return true;
  }
  return null;
}
