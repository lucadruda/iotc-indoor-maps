import axios from "axios";
import { appendFile } from "fs";

const GEOGRAPHY = "us";
const API_VERSION = "2.0";
const DATASET_ID = "ecb0f4ee-d07f-1b58-3ea2-3601c8b91a5e";
export const subscriptionKey = "aipGMyZjmHtjPnOTGTCbWQawlMoQ6MOwVLN2QFpa4fw";
export const tilesetIds = [
  "0d76d5d2-36fc-1aaa-d511-0302eb3e4bc4",
  "b89f4509-e318-3860-0c5f-4aa85571d7ad",
];
export const statesetId = "9587d752-caad-37a2-bd2a-a4db8afc0e70";

export const TV_MODEL = "dtmi:modelDefinition:ndexursjf:eie12urydm";
export const THERMOSTAT_MODEL = "dtmi:modelDefinition:frfn3tauo:xwmfyixfc5";

export async function getFeatureState(roomId: string) {
  try {
    const res = await axios.get<any>(
      `https://${GEOGRAPHY}.atlas.microsoft.com/featureStateSets/${statesetId}/featureStates/${roomId}?subscription-key=${subscriptionKey}&api-version=${API_VERSION}`
    );
    if ([200, 201].includes(res.status)) {
      return res.data;
    }
    return res.statusText;
  } catch (ex) {
    if (ex.response.status === 400) {
      return null;
    }
  }
}

export async function setFeatureState(
  roomId: string,
  keyName: string,
  value: string
) {
  const data = {
    states: [
      {
        keyName,
        value,
        eventTimestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await axios.put<any>(
      `https://${GEOGRAPHY}.atlas.microsoft.com/featureStateSets/${statesetId}/featureStates/${roomId}?subscription-key=${subscriptionKey}&api-version=${API_VERSION}`,
      data
    );
    if ([200, 201].includes(res.status)) {
      return res.data;
    }
    return res.statusText;
  } catch (ex) {
    if (ex.response.status === 400) {
      return null;
    }
  }
}

export async function getFeatures(
  url: string | null,
  features?: any[]
): Promise<any[]> {
  if (!features) {
    features = [];
  }
  if (!url) {
    url = `https://${GEOGRAPHY}.atlas.microsoft.com/wfs/datasets/${DATASET_ID}/collections/unit/items?subscription-key=${subscriptionKey}&api-version=${API_VERSION}`;
  } else {
    url += `&subscription-key=${subscriptionKey}`;
  }
  const res = await axios.get<any>(url);
  if (res.status === 200) {
    features = features.concat(res.data.features);
    const nextLink = res.data.links.find((l: any) => l.rel === "next");
    if (nextLink) {
      features = await getFeatures(nextLink.href, features);
    }
  }
  return features;
}

export const FEATURE_MAP = {
  "201": 122,
  "202": 119,
  "203": 118,
  "204": 117,
  "205": 116,
  "206": 115,
  "207": 112,
  "208": 111,
  "209": 114,
  "210": 113,
  "211": 123,
  "212": 104,
  "213": 121,
  "214": 105,
  "215": 120,
  "216": 103,
  "217": 124,
  "218": 106,
  "219": 125,
  "220": 107,
  "221": 126,
  "222": 108,
  "223": 127,
  "224": 109,
  "225": 128,
  "226": 110,
  "236": 97,
  "237": 96,
  "238": 98,
  "239": 95,
  "240": 99,
  "241": 94,
  "242": 100,
  "243": 93,
  "244": 101,
  "245": 92,
  "246": 102,
  "247": 91,
  "248": 82,
  "249": 81,
  "250": 88,
  "251": 87,
  "252": 89,
  "253": 83,
  "254": 90,
  "255": 84,
  "256": 86,
  "257": 85,
  undefined: 79,
  CIRC201: 78,
  CIRC202: 80,
  CIRC203: 79,
  B47: 152,
  B45: 153,
  B43: 154,
  B41: 155,
  B39: 156,
  B37: 157,
  B36: 158,
  B38: 159,
  B40: 160,
  B42: 161,
  B44: 162,
  B46: 163,
  B06: 176,
  B05: 177,
  B01: 178,
  B15: 182,
  B13: 183,
  B11: 184,
  B17: 185,
  B19: 186,
  B21: 187,
  B23: 188,
  B25: 189,
  B49: 142,
  B48: 143,
  B53: 144,
  B55: 145,
  B57: 146,
  B56: 147,
  B51: 148,
  B50: 149,
  B52: 150,
  B54: 151,
  B16: 164,
  B12: 165,
  B14: 166,
  B18: 167,
  B20: 168,
  B22: 169,
  B24: 170,
  B26: 171,
  B08: 172,
  B07: 173,
  B10: 174,
  B09: 175,
  CIRCB01: 139,
  CIRCB02: 141,
  CIRCB03: 140,
  B04: 179,
  B03: 180,
  B02: 181,
  "101": 61,
  "102": 58,
  "103": 57,
  "104": 56,
  "105": 55,
  "106": 54,
  "107": 51,
  "108": 50,
  "109": 53,
  "110": 52,
  "111": 62,
  "112": 43,
  "113": 60,
  "114": 44,
  "115": 59,
  "116": 42,
  "117": 63,
  "118": 45,
  "119": 64,
  "120": 46,
  "121": 65,
  "122": 47,
  "123": 66,
  "124": 48,
  "125": 67,
  "126": 49,
  "136": 36,
  "137": 35,
  "138": 37,
  "139": 34,
  "140": 38,
  "141": 33,
  "142": 39,
  "143": 32,
  "144": 40,
  "145": 31,
  "146": 41,
  "147": 30,
  "148": 21,
  "149": 20,
  "150": 27,
  "151": 26,
  "152": 28,
  "153": 22,
  "154": 29,
  "155": 23,
  "156": 25,
  "157": 24,
  CIRC101: 17,
  CIRC102: 19,
  CIRC103: 18,
};

export function isTVTelemetry(telemetry: any): boolean {
  return telemetry.templateId === TV_MODEL;
}

export function isThermostatTelemetry(telemetry: any): boolean {
  return telemetry.templateId === THERMOSTAT_MODEL;
}
