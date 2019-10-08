import { substitute } from "./StringUtils";

/**
 * 用于处理语言/文字显示
 */
export function getLangUtil(msgDict?: { [index: string]: string }) {
    msgDict = msgDict || {};
    return {

        /**
         * 获取显示的信息
         * 
         * @static
         * @param {(number | string)} code code码
         * @param {any} args 其他参数  替换字符串中{0}{1}{2}{a} {b}这样的数据，用obj对应key替换，或者是数组中对应key的数据替换
         * @returns 显示信息
         */
        getMsg(_p0: number | string, ..._p1: any[]) {
            const argus = arguments;
            let code = argus[0];
            let len = argus.length;
            let args;
            if (len == 2) {
                args = argus[1];
            } else if (len > 2) {
                args = [];
                let j = 0;
                for (let i = 1; i < len; i++) {
                    args[j++] = argus[i];
                }
            }
            if (msgDict && code in msgDict) {
                return substitute(msgDict[code], args)
            }
            return typeof code === "string" ? substitute(code, args) : code + "";
        },
        has(code: Key) {
            return code in msgDict;
        },
        /**
         * 
         * 注册语言字典
         * @static
         * @param { { [index: string]: string }} data
         */
        regMsgDict(data: { [index: string]: string }) {
            msgDict = data;
        }
    }
}

export type LangUtil = ReturnType<typeof getLangUtil>;

/**
 * 默认的语言工具
 */
export const LangUtil = getLangUtil();