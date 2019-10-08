declare const enum HttpMethod {
    /**
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
     */
    GET = "GET",
    /**
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
     */
    POST = "POST"
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/response
 */
declare const enum HttpResponseType {
    Text = "text",
    ArrayBuffer = "arraybuffer",

    JSON = "json",

    Blob = "blob",

    Document = "document",

    /**
     * 等同于 `text`
     */
    Empty = ""
}