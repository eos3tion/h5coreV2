import { getColorString } from "../data/Color";

/**
 * HTML工具类
 * @author 3tion
 */
const unescChars: { [key: string]: string } = { "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&apos;": "\'", "&amp;": "&", "&nbsp;": " ", "&#x000A;": "\n" };


/**
 * 将HTML特殊符号，恢复成正常字符串
 * 
 * @param {string} content 
 * @returns 
 */
export function unescHTML(content: string) {
    return content.replace(/&lt;|&gt;|&quot;|&apos;|&amp;|&nbsp;|&#x000A;/g,
        function (substring: string) {
            return unescChars[substring];
        });
}


const escChars: { [key: string]: string } = { "<": "&lt;", ">": "&gt;", "'": "&apos;", "\"": "&quot;", "&": "&amp;" };

/**
 * 将特殊字符串处理为HTML转义字符
 * 
 * @param {string} content 
 */
export function escHTML(content: string) {
    return content.replace(/<|>|"|'|&/g,
        function (substring: string) {
            return escChars[substring];
        });
}
/**
 * 字符着色
 * 
 * @param {string | number} value       内容
 * @param {(string | number)} color     颜色
 * @returns 
 */
export function createColorHtml(value: string | number, color: string | number) {
    let c: string;
    if (typeof color == "number") {
        c = getColorString(color);
    } else if (color.charAt(0) != "#") {
        c = "#" + color;
    } else {
        c = color;
    }
    return "<font color=\'" + c + "\'>" + value + "</font>";
}

/**
 * 清理html;
 * @value value
 * @return
 *
 */
export function clearHtml(value: string) {
    return value.replace(/<[^><]*?>/g, "");
}
