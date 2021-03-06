import { ThrowError } from "../debug/ThrowError";

export const Empty = Object.freeze({});

export const EmptyArray = Object.freeze([]);

export const SharedPoint: Point2 = { x: 0, y: 0 };

export const SharedArray: any[] = [];
export const SharedArray1: any[] = [];

export function Noop() { };

export function Pipe<T>(arg: T): T {
    return arg;
}

export function TruthyFun() { return true }

export function FalsyFun() { return false }

export function MustReplace<T>(errorMsg: string) {
    return function (...args: any[]): T {
        if (DEBUG) {
            throw Error(errorMsg);
        } else {
            ThrowError(errorMsg)
        }
        return
    }
} 