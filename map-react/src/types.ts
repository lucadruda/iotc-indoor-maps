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

export type TVProperties = {
  name: string;
  ipaddress: string;
};

export type ThermostatProperties = {
  name: string;
  targetTemperature: number;
  maxTempSinceLastReboot: number;
};
