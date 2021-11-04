export type IoTCDevice = {
  id: string;
  etag?: string;
  displayName: string;
  simulated: boolean;
  provisioned: boolean;
  template: string;
  enabled: boolean;
};

export type Device = IoTCDevice & {
  properties?: { [propId: string]: any };
};

export type DeviceProperties = { id: string; name: string };

export type TVProperties = DeviceProperties & {
  ipaddress: string;
};

export type ThermostatProperties = DeviceProperties & {
  targetTemperature: number;
  maxTempSinceLastReboot: number;
};
