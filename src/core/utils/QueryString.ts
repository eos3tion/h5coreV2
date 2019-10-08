export function getQueryString() {
    let d = {} as { [key: string]: any };
    let c = window.location.search.substring(1);
    let e = c.split("&");
    for (let b = 0; b < e.length; b++) {
        let f = e[b].split("=");
        let [key, val] = f;
        let oldVal = d[key];
        if (typeof oldVal === "undefined") {
            d[key] = val;
        } else {
            if (typeof oldVal === "string") {
                d[key] = [oldVal, val];
            } else {
                d[key].push(val)
            }
        }
    }
    return d;
}