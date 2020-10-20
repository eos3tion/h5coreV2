import { ThrowError } from "../debug/ThrowError";

export const Empty = Object.freeze({});

export const EmptyArray = Object.freeze([]);

export function Noop() { };

export function Pipe<T>(arg: T): T {
    return arg;
}

export function TruthyFun() { return true }

export function FalsyFun() { return false }

export function MustReplace(errorMsg: string) {
    return function () {
        if (DEBUG) {
            throw Error(errorMsg);
        } else {
            ThrowError(errorMsg)
        }
    }
} 