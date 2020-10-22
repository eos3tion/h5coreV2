

declare module egret {

    export interface Texture {
        tx?: number;
        ty?: number;
    }
    export interface Bitmap {
        /**
         * 刷新纹理
         */
        refreshBMD(): void;

        /**
         * 占位用纹理
         * 
         */
        placehoder?: Texture;
    }

    export interface DisplayObject {
        /**
         * 扩展sui的可视对象，的原始尺寸和坐标  
         * 由flash导出的原始视图尺寸
         * @type {SuiRawRect}
         * @memberOf DisplayObject
         */
        suiRawRect?: SuiRawRect;
        /**
         * sui的资源名称
         */
        suiLib?: string;
        /**
         * sui的引用名称
         */
        suiClass?: string;

        [name: string]: any;
    }

    export interface TextField {
        /**
         * 原始的文本数据
         */
        rawTextData: import("./creator/TextFieldCreator").TextData;
        /**
         * 
         * 设置Html文本(慎用，废性能)
         * @param {string | number} value
         */
        setHtmlText(value: string | number): void;
    }

    export interface Graphics {
        /**
         * 使用  junyou.Rect 作为参数 进行绘制矩形
         * 
         * @param { jy.Rect} rect 
         * @memberof Graphics
         */
        drawRectangle(rect: Rect): void;
    }

    export interface TouchEvent {
        /** 
         * 和上一帧的 X偏移量
         */
        deltaX?: number;
        /**
         * 和上一帧的 Y偏移量
         */
        deltaY?: number;

        /**
         * 和上一帧的 时间差值
         */
        deltaTime?: number;
    }

    export interface DisplayObject extends ViewDele {

    }
}
interface SuiRawRect extends egret.Rectangle {
}
