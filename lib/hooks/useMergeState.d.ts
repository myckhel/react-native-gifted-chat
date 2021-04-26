import { RefObject } from 'react';
export declare type StateType<IState> = {
    [key: string]: IState;
    [key: number]: IState;
};
export declare type StateReturnsType<S> = [S, SetMergeType<S>, RefObject<S>];
export declare type MergeFnType = (obj1: {}, obj2: {}) => {};
export declare type SetMergeStateOrFnType<S> = object | ((currentState: S, mergeFn: MergeFnType) => S);
export declare type SetMergeCallbackType<S> = (currentState: S) => void;
export declare type SetMergeType<S> = (newStateOrSetter: SetMergeStateOrFnType<S>, callback?: SetMergeCallbackType<S>) => void;
export declare const useMergeState: <S = {}>(initialState: S) => StateReturnsType<S>;
export default useMergeState;
