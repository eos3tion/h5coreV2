/**
 * 和NodeJS有点区别
 */
export interface ParsedPath {

    /**
     * The full directory path such as '/home/user/dir' or 'c:\path\dir'
     */
    dir: string;
    /**
     * The file name including extension (if any) such as 'index.html'
     */
    base: string;
    /**
     * The file extension (if any) such as '.html'
     */
    ext: string;
    /**
     * The file name without extension (if any) such as 'index'
     */
    name: string;

    /**
     * 末尾是否有`/`
     */
    backslash: boolean;
}


export function parsePath(url: string) {
    let path = {} as ParsedPath;
    let a = url.lastIndexOf("/");
    let b = url.lastIndexOf("\\");
    if (a < b) {
        path.dir = url.slice(0, b);
        url = url.slice(b + 1);
        path.backslash = true
    } else {
        if (b < a) {
            path.dir = url.slice(0, a);
            url = url.slice(a + 1)
        } else {
            path.dir = ""
        }
    }
    let dot = url.lastIndexOf(".");
    let search = url.lastIndexOf("?");
    search == -1 && (search = undefined);
    dot == -1 && (dot = undefined);
    path.ext = dot != undefined ? url.slice(dot, search) : "";
    path.name = url.slice(0, dot);
    path.base = url.slice(0, search);
    return path
}
