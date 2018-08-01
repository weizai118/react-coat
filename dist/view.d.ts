import { ActionHandlerList } from "./global";
import { ComponentType } from "react";
export declare function exportViews<T>(views: T, model: {
    namespace: string;
    handlers: ActionHandlerList;
}): T;
export declare function exportModule<T>(namespace: string): {
    namespace: string;
    actions: T;
};
export interface Views {
    [viewName: string]: ComponentType<any>;
}
export interface ModuleViews {
    default: Views;
}
