import { useCallback, useReducer } from "react";

export const subscriptionKey = "aipGMyZjmHtjPnOTGTCbWQawlMoQ6MOwVLN2QFpa4fw";
export const tilesetIds = [
  "0d76d5d2-36fc-1aaa-d511-0302eb3e4bc4",
  "b89f4509-e318-3860-0c5f-4aa85571d7ad",
];
export const statesetId = "15368145-028a-e2a2-25f8-c72ed2825874";

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
