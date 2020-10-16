export const Empty = Object.freeze({});

export const EmptyArray = Object.freeze([]);

export const Noop = function () { };

export const Pipe = function <T>(arg: T): T {
    return arg;
}

export const TruthyFun = function () { return true }

export const FalsyFun = function () { return false }