declare module egret {
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
    }
}

interface SuiRawRect extends egret.Rectangle {
}
