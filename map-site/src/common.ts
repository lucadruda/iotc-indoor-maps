import { data } from "azure-maps-control";
import { useCallback, useReducer } from "react";

export const APP_URL =
  window.REACT_APP_IOTC_APP_URL ||
  process.env["REACT_APP_IOTC_APP_URL"] ||
  "";
export const API_VERSION = "1.0";
export const API_KEY =
  window.REACT_APP_IOTC_API_KEY || process.env["REACT_APP_IOTC_API_KEY"] || "";
export const MAP_SUBSCRIPTION_KEY =
  window.REACT_APP_MAP_SUBSCRIPTION_KEY ||
  process.env["REACT_APP_MAP_SUBSCRIPTION_KEY"] ||
  "";
export const MAP_STATESET_ID =
  window.REACT_APP_MAP_STATESET_ID ||
  process.env["REACT_APP_MAP_STATESET_ID"] ||
  "";
export const MAP_TILESET_ID =
  window.REACT_APP_MAP_TILESET_ID || process.env["REACT_APP_MAP_TILESET_ID"] || "";

  export const MAP_DATASET_ID =
  window.REACT_APP_MAP_DATASET_ID || process.env["REACT_APP_MAP_DATASET_ID"] || "";

export const MAP_LAT =
  window.REACT_APP_MAP_LAT ||
  process.env["REACT_APP_MAP_LAT"] ||
  46.946908419572395;
export const MAP_LON =
  window.REACT_APP_MAP_LON ||
  process.env["REACT_APP_MAP_LON"] ||
  7.446113203345874;

type Feature = data.Feature<data.Geometry, any>;

enum CardActionType {
  OPEN = "OPEN",
  DISMISS = "DISMISS",
}
type CardActions = {
  type: CardActionType;
  payload?: Partial<CardState>;
};
type CardState = {
  id: string | null;
  data: any | null;
  pagePosition: [number, number] | null;
  show: boolean;
};
type CardItems = {
  open: (id: string, data: any, pagePosition: [number, number]) => void;
  dismiss: () => void;
  state: CardState;
};

export function useCard(): CardItems {
  const reducer = (state: CardState, action: CardActions) => {
    switch (action.type) {
      case CardActionType.OPEN:
        return { ...state, ...action.payload, show: true };
      case CardActionType.DISMISS:
        return { ...state, id: null, data: null, event: null, show: false };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    id: null,
    data: null,
    pagePosition: null,
    show: false,
  });

  const open = useCallback(
    (id: string, data: any, pagePosition: [number, number]) => {
      dispatch({
        type: CardActionType.OPEN,
        payload: { id, data, pagePosition },
      });
    },
    [dispatch]
  );

  const dismiss = useCallback(() => {
    dispatch({
      type: CardActionType.DISMISS,
    });
  }, []);
  return { open, dismiss, state };
}

export function getRandomPosition(feature: Feature): [number, number] {
  const pos = feature.geometry.coordinates[0] as data.Position[];
  return [
    Math.random() * (pos[0][0] - pos[2][0]) + pos[2][0],
    Math.random() * (pos[0][1] - pos[1][1]) + pos[1][1],
  ];
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