import { data } from "azure-maps-control";
import { useCallback, useReducer } from "react";

export const APP_NAME = process.env["REACT_APP_IOTC_APP_SUBDOMAIN"] || "";
export const DOMAIN = "azureiotcentral.com";
export const API_VERSION = "1.0";
export const API_KEY = process.env["REACT_APP_IOTC_API_KEY"] || "";
export const MAP_SUBSCRIPTION_KEY =
  process.env.REACT_MAP_SUBSCRIPTION_KEY || "";
export const MAP_STATESET_ID = process.env.REACT_MAP_STATESET_ID || "";

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
