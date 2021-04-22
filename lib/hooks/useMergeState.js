import { useState, useRef, useCallback } from 'react';
const merge = (obj1, obj2) => ({ ...obj1, ...obj2 });
export const useMergeState = (initialState) => {
    const [state, setState] = useState(initialState);
    const stateRef = useRef(state);
    stateRef.current = state;
    const setMergeState = useCallback((newState, callback) => {
        setState(typeof newState === 'function'
            ? newState(stateRef.current, merge)
            : merge(stateRef.current, newState));
        if (callback) {
            callback(stateRef.current);
        }
    }, [stateRef]);
    return [state, setMergeState, stateRef];
};
export default useMergeState;
//# sourceMappingURL=useMergeState.js.map