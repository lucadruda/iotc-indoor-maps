import axios from "axios";
import { MAP_STATESET_ID, MAP_SUBSCRIPTION_KEY } from "./common";
const GEOGRAPHY = "us";
const API_VERSION = "2.0";
const DATASET_ID = "ecb0f4ee-d07f-1b58-3ea2-3601c8b91a5e";
const COLLECTION_ID = "unit";

export async function getFeatures(
  url: string | null,
  features?: any[]
): Promise<any[]> {
  if (!features) {
    features = [];
  }
  if (!url) {
    url = `https://${GEOGRAPHY}.atlas.microsoft.com/wfs/datasets/${DATASET_ID}/collections/${COLLECTION_ID}/items?subscription-key=${MAP_SUBSCRIPTION_KEY}&api-version=${API_VERSION}`;
  } else {
    url += `&subscription-key=${MAP_SUBSCRIPTION_KEY}`;
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

export async function reserveRoom(roomId: string, free: boolean = false) {
  const res = await fetch(
    `https://${GEOGRAPHY}.atlas.microsoft.com/featurestatesets/${MAP_STATESET_ID}/featureStates/${roomId}?subscription-key=${MAP_SUBSCRIPTION_KEY}&api-version=${API_VERSION}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "utf-8",
      },
      body: JSON.stringify({
        states: [
          {
            keyName: "reserved",
            value: !free,
            eventTimestamp: new Date().toISOString(),
          },
        ],
      }),
    }
  );
  if (res.status > 400) {
    throw new Error(`State can't be set`);
  }
}

export async function occupyRoom(roomId: string, free: boolean = false) {
  const res = await fetch(
    `https://${GEOGRAPHY}.atlas.microsoft.com/featurestatesets/${MAP_STATESET_ID}/featureStates/${roomId}?subscription-key=${MAP_SUBSCRIPTION_KEY}&api-version=${API_VERSION}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "utf-8",
      },
      body: JSON.stringify({
        states: [
          {
            keyName: "occupied",
            value: !free,
            eventTimestamp: new Date().toISOString(),
          },
        ],
      }),
    }
  );
  if (res.status > 400) {
    throw new Error(`State can't be set`);
  }
}
