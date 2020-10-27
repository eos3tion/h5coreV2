import { EmptyArray } from "../../core/constants/Shared";
import { Mediator } from "../../core/mvc/core/Mediator";
import { Res } from "../../core/res/Res";
import { Panel } from "./components/Panel";


/**
 * 移除可视对象
 * 
 * @export
 * @param {egret.DisplayObject} display
 */
export function removeDisplay(display: egret.DisplayObject, fire = true) {
    if (display && display.parent) {
        display.parent.removeChild(display, fire);
    }
}

class HttpRequest extends egret.HttpRequest implements IHttpRequest {
    request({ responseType, url, header, method, data }: HttpRequestParam) {
        this.responseType = responseType;
        for (const key in header) {
            this.setRequestHeader(key, header[key]);
        }
        this.open(url, method);
        this.send(data);
    }

}

export function extendEgret() {
    const { Bitmap, TextField, Graphics } = egret;

    let bpt = Bitmap.prototype;
    bpt.refreshBMD = function () {
        let tex = this.texture;
        if (tex != null) {
            this.texture = null;
            this.texture = tex;
        }
    }
    /**重写Bitmap.prototype.$refreshImageData用于支持egret的webgl渲染 */
    let $rawRefreshImageData = bpt.$refreshImageData;
    bpt.$refreshImageData = function (this: egret.Bitmap) {
        $rawRefreshImageData.call(this);
        let bmd = this.$bitmapData;
        if (bmd) {
            this.$sourceWidth = bmd.width;
            this.$sourceHeight = bmd.height;
            this.$updateRenderNode();
        }
    }
    const htmlTextParser = new egret.HtmlTextParser();
    TextField.prototype.setHtmlText = function (this: egret.TextField, value?: string | number) {
        if (value == undefined) {
            value = "";
        } else if (typeof value == "number") {
            value = value + "";
        }
        this.textFlow = value ? htmlTextParser.parser(value) : EmptyArray as egret.ITextElement[];
    }


    Graphics.prototype.drawRectangle = function (this: egret.Graphics, rect: Rect) {
        this.drawRect(rect.x, rect.y, rect.width, rect.height);
    }

    Mediator.prototype.createPanel = function (key, className, ...deps) {
        let panel = new Panel();
        panel.bind(key, className, ...deps);
        return panel;
    }

    Res.setRequest(HttpRequest);
}