import { useCallback, useReducer } from "react";

export const subscriptionKey = "lR1ByZj_gPUI-joGKchxrimkIzrms0CoMO_bvEmOCtM";
export const tilesetId = "b5881c4b-2149-a364-7e15-5ee2f339e26b";
export const statesetId = "7c8723aa-3501-cf02-5728-b1e607b0ab5e";

enum CalloutActionType {
    OPEN = 'OPEN',
    DISMISS = 'DISMISS'
}
type CalloutActions = {
    type: CalloutActionType,
    payload?: Partial<CalloutState>
}
type CalloutState = {
    id: string | null,
    data: any | null,
    event: MouseEvent | null,
    show: boolean
}
type CalloutItems = {
    open: (id: string, data: any, event: MouseEvent) => void
    dismiss: () => void,
    state: CalloutState

}

export function useCallout(): CalloutItems {
    const reducer = (state: CalloutState, action: CalloutActions) => {
        switch (action.type) {
            case CalloutActionType.OPEN:
                return { ...state, ...action.payload, show: true }
            case CalloutActionType.DISMISS:
                return { ...state, id: null, data: null, event: null, show: false }
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(reducer, { id: null, data: null, event: null, show: false });

    const open = useCallback((id: string, data: any, event: MouseEvent) => {
        dispatch({
            type: CalloutActionType.OPEN,
            payload: { id, data, event }
        });
    }, [dispatch]);

    const dismiss = useCallback(() => {
        dispatch({
            type: CalloutActionType.DISMISS
        })
    }, []);
    return { open, dismiss, state }
}