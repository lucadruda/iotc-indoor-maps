import { statesetId, subscriptionKey } from './common';
const GEOGRAPHY = 'us';
const API_VERSION = '2.0';
const DATASET_ID = '';
const COLLECTION_ID = '';

export async function getFeatures() {
    await fetch(
        `https://${GEOGRAPHY}.atlas.microsoft.com/wfs/datasets/${DATASET_ID}/collections/${COLLECTION_ID}/items?subscription-key=${subscriptionKey}&api-version=${API_VERSION}&filter={ filter } `);

}

export async function reserveRoom(roomId: string, free: boolean = false) {
    const res = await fetch(
        `https://${GEOGRAPHY}.atlas.microsoft.com/featurestatesets/${statesetId}/featureStates/${roomId}?subscription-key=${subscriptionKey}&api-version=${API_VERSION}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Encoding': 'utf-8'
            },
            body: JSON.stringify({
                states: [
                    {
                        keyName: "reserved",
                        value: !free,
                        eventTimestamp: new Date().toISOString()
                    }
                ]
            })
        });
    if (res.status > 400) {
        throw new Error(`State can't be set`);
    }
}

export async function occupyRoom(roomId: string, free: boolean = false) {
    const res = await fetch(
        `https://${GEOGRAPHY}.atlas.microsoft.com/featurestatesets/${statesetId}/featureStates/${roomId}?subscription-key=${subscriptionKey}&api-version=${API_VERSION}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Encoding': 'utf-8'
            },
            body: JSON.stringify({
                states: [
                    {
                        keyName: "occupied",
                        value: !free,
                        eventTimestamp: new Date().toISOString()
                    }
                ]
            })
        });
    if (res.status > 400) {
        throw new Error(`State can't be set`);
    }
}