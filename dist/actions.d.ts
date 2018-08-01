import { Action } from "redux";
import { SagaIterator } from "redux-saga";
import { call, CallEffect, put, PutEffect } from "redux-saga/effects";
import { ActionHandlerList, BaseModuleState, RootState } from "./global";
export { PutEffect };
export declare class BaseModuleHandlers<S extends BaseModuleState = any, R extends RootState = any, A extends Actions<BaseModuleHandlers> = any> {
    protected readonly actions: A;
    protected readonly namespace: string;
    protected readonly initState: S;
    protected readonly put: typeof put;
    protected readonly call: typeof call;
    protected readonly callPromise: typeof callPromise;
    protected readonly state: S;
    protected readonly rootState: R;
    INIT(): S;
    STARTED(payload: S): S;
    LOADING(payload: {
        [group: string]: string;
    }): S;
    START(): SagaIterator;
}
export declare function exportModel<S, A extends {
    [K in keyof A]: (payload?: any) => S | SagaIterator;
}>(namespace: string, initState: S, handlers: A): {
    namespace: string;
    handlers: ActionHandlerList;
};
export declare function logger(before: (action: Action, moduleName: string) => void, after: (beforeData: any, data: any) => void): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function loading(loadingKey?: string): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare const globalLoading: (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): void;
export declare function effect(target: any, key: string, descriptor: PropertyDescriptor): void;
export interface CallProxy<T> extends CallEffect {
    getResponse: () => T;
}
export declare function callPromise<R, T extends any[]>(fn: (...args: T) => Promise<R>, ...rest: T): CallProxy<R>;
export declare type Actions<Ins> = {
    [K in keyof Ins]: Ins[K] extends () => any ? () => {
        type: string;
    } : Ins[K] extends (data: infer P) => any ? (payload: P) => {
        type: string;
        payload: P;
    } : never;
};
