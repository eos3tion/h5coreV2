
/**
 * 参考createjs和白鹭的tween
 * 调整tick的驱动方式
 * https://github.com/CreateJS/TweenJS
 * @author 3tion
 */

export interface IEaseFunction {
    (t: number, ...args: any[]): number
}

const { PI, sin, cos, pow, abs, sqrt, asin } = Math;

const PI2 = PI * 2;

function getPowIn(p: number): IEaseFunction {
    return function (t) {
        return pow(t, p);
    }
}

function getPowOut(p: number): IEaseFunction {
    return function (t) {
        return 1 - pow(1 - t, p);
    }
}
function getPowInOut(p: number): IEaseFunction {
    return function (t) {
        if ((t *= 2) < 1) return 0.5 * pow(t, p);
        return 1 - 0.5 * abs(pow(2 - t, p));
    }
}
function getBackIn(amount: number): IEaseFunction {
    return function (t) {
        return t * t * ((amount + 1) * t - amount);
    }
}

function getBackOut(amount: number): IEaseFunction {
    return function (t) {
        return (--t * t * ((amount + 1) * t + amount) + 1);
    }
}
function getBackInOut(amount: number): IEaseFunction {
    amount *= 1.525;
    return function (t) {
        if ((t *= 2) < 1) return 0.5 * (t * t * ((amount + 1) * t - amount));
        return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
    }
}
function getElasticIn(amplitude: number, period: number): IEaseFunction {
    return function (t) {
        if (t == 0 || t == 1) return t;
        var s = period / PI2 * asin(1 / amplitude);
        return -(amplitude * pow(2, 10 * (t -= 1)) * sin((t - s) * PI2 / period));
    }
}
function getElasticOut(amplitude: number, period: number): IEaseFunction {
    return function (t) {
        if (t == 0 || t == 1) return t;
        var s = period / PI2 * asin(1 / amplitude);
        return (amplitude * pow(2, -10 * t) * sin((t - s) * PI2 / period) + 1);
    }
}
function getElasticInOut(amplitude: number, period: number): IEaseFunction {
    return function (t) {
        var s = period / PI2 * asin(1 / amplitude);
        if ((t *= 2) < 1) return -0.5 * (amplitude * pow(2, 10 * (t -= 1)) * sin((t - s) * PI2 / period));
        return amplitude * pow(2, -10 * (t -= 1)) * sin((t - s) * PI2 / period) * 0.5 + 1;
    }
}


function bounceIn(t: number): number {
    return 1 - bounceOut(1 - t);
}
function bounceOut(t: number): number {
    if (t < 1 / 2.75) {
        return (7.5625 * t * t);
    } else if (t < 2 / 2.75) {
        return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
    } else if (t < 2.5 / 2.75) {
        return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
    } else {
        return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
    }
}
function bounceInOut(t: number): number {
    if (t < 0.5) return bounceIn(t * 2) * .5;
    return bounceOut(t * 2 - 1) * 0.5 + 0.5;
}

/**
 * tween的执行效果，参考页面：http://www.cnblogs.com/cloudgamer/archive/2009/01/06/Tween.html
 * 
 * @export
 * @class Ease
 */
export const Ease = {

    /**
     * 根据起始值和终值，及当前进度率得到结果
     * 
     * @static
     * @param {number} v0       起始值
     * @param {number} v1       终值
     * @param {number} ratio    进度率
     * @returns
     */
    getValue(v0: number, v1: number, ratio: number) {
        if (v0 == v1 || ratio == 0 || ratio == 1 || (typeof v0 != "number")) {
            return ratio == 1 ? v1 : v0;
        } else {
            return v0 + (v1 - v0) * ratio;
        }
    },
    get(amount: number): IEaseFunction {
        if (amount < -1) {
            amount = -1;
        }
        if (amount > 1) {
            amount = 1;
        }
        return function (t) {
            if (amount == 0) {
                return t;
            }
            if (amount < 0) {
                return t * (t * -amount + 1 + amount);
            }
            return t * ((2 - t) * amount + (1 - amount));
        }
    },
    getPowIn,
    getPowOut,
    getPowInOut,
    quadIn: getPowIn(2),
    quadOut: getPowOut(2),
    cubicIn: getPowIn(3),
    cubicOut: getPowOut(3),
    cubicInOut: getPowInOut(3),
    quartIn: getPowIn(4),
    quartOut: getPowOut(4),
    quartInOut: getPowInOut(4),
    quintIn: getPowIn(5),
    quintOut: getPowOut(5),
    quintInOut: getPowInOut(5),
    sineIn(t: number): number {
        return 1 - cos(t * PI / 2);
    },
    sineOut(t: number): number {
        return sin(t * PI / 2);
    },
    sineInOut(t: number): number {
        return -0.5 * (cos(PI * t) - 1)
    },
    getBackIn,
    getBackOut,
    getBackInOut,
    backIn: getBackIn(1.7),
    backOut: getBackOut(1.7),
    backInOut: getBackInOut(1.7),
    circIn(t: number): number {
        return -(sqrt(1 - t * t) - 1);
    },
    circOut(t: number): number {
        return sqrt(1 - (--t) * t);
    },
    circInOut(t: number): number {
        if ((t *= 2) < 1) {
            return -0.5 * (sqrt(1 - t * t) - 1);
        }
        return 0.5 * (sqrt(1 - (t -= 2) * t) + 1);
    },
    bounceIn,
    bounceOut,
    bounceInOut,
    elasticIn: getElasticIn(1, 0.3),
    elasticOut: getElasticOut(1, 0.3),
    elasticInOut: getElasticInOut(1, 0.3 * 1.5),
    getElasticIn,
    getElasticOut,
    getElasticInOut,
}
