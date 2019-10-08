import { EventEmitter } from "../utils/EventEmitter";

let hasXMLHttpRequest: boolean;
function getXHR() {
    return new XMLHttpRequest();
}


function onload(this: HttpRequest) {
    let self = this;
    window.setTimeout(function () {
        self.dispatch(EventConst.Complete);
    }, 0);
}

function onerror(this: HttpRequest) {
    let self = this;
    window.setTimeout(function () {
        self.dispatch(EventConst.Error);
    }, 0);
}

function updateProgress(this: HttpRequest, event: ProgressEvent) {
    if (event.lengthComputable) {
        this.dispatchEvent(event);
    }
}

function onReadyStateChange(this: HttpRequest) {
    let xhr = this.xhr;
    if (xhr.readyState == 4) {// 4 = "loaded"
        let ioError = (xhr.status >= 400 || xhr.status == 0);
        let self = this;
        window.setTimeout(function () {
            if (ioError) {//请求错误
                self.dispatch(EventConst.Error);
            }
            else {
                self.dispatch(EventConst.Complete);
            }
        }, 0)

    }
}

export class HttpRequest extends EventEmitter {
    xhr: XMLHttpRequest;

    timeout = 0;

    readonly responseType: HttpResponseType;

    withCredentials: boolean;

    readonly url = "";

    readonly method = HttpMethod.GET;

    readonly headerObj: any;

    public get response() {
        const { xhr, responseType } = this;
        if (xhr) {

            if (xhr.response != undefined) {
                return xhr.response;
            }

            if (responseType == HttpResponseType.Text || responseType == HttpResponseType.Empty) {
                return xhr.responseText;
            }

            if (responseType == HttpResponseType.Document) {
                return xhr.responseXML;
            }
        }
    }

    setResponseType(value: HttpResponseType) {
        //@ts-ignore
        this.responseType = value;
    }

    setRequestHeader(header: string, value: string): void {
        if (!this.headerObj) {
            this.resetRequestHeader();
        }
        this.headerObj[header] = value;
    }

    resetRequestHeader() {
        //@ts-ignore
        this.headerObj = {};
    }

    getAllResponseHeaders() {
        let xhr = this.xhr;
        if (xhr) {
            let result = this.xhr.getAllResponseHeaders();
            return result ? result : "";
        }
    }

    open(url: string, method = HttpMethod.GET) {
        //@ts-ignore
        this.url = url; this.method = method;
        let xhr = this.xhr;
        if (xhr) {
            xhr.abort();
        }
        xhr = getXHR();
        this.xhr = xhr;
        if (hasXMLHttpRequest) {
            xhr.addEventListener("load", onload.bind(this));
            xhr.addEventListener("error", onerror.bind(this));
        } else {
            xhr.onreadystatechange = onReadyStateChange.bind(this);
        }
        xhr.onprogress = updateProgress.bind(this);
        xhr.ontimeout = onerror.bind(this)
        xhr.open(method, url, true);
    }
    send(data?: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>) {
        const { xhr, responseType, withCredentials, headerObj } = this;
        if (responseType != null) {
            xhr.responseType = responseType;
        }
        if (withCredentials != null) {
            xhr.withCredentials = this.withCredentials;
        }
        if (headerObj) {
            for (let key in headerObj) {
                xhr.setRequestHeader(key, headerObj[key]);
            }
        }
        xhr.timeout = this.timeout;
        xhr.send(data);
    }

    /**
     * 尝试取消加载
     */
    cancel() {
        let xhr = this.xhr;
        if (xhr) {
            xhr.abort();
        }
    }
}