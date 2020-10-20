import { ThrowError } from "../debug/ThrowError";

export const Empty = Object.freeze({});

export const EmptyArray = Object.freeze([]);

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