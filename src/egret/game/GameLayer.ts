import { doSort } from "../../core/utils/ArrayUtil";
import { GameEngine } from "./GameEngine";
import { IDepth } from "./IDepth";


export interface GameLayer extends egret.DisplayObject {
    id: number;

    isShow?: boolean;
}

/**
 * GameLayer
 * 用于后期扩展
 */
export class BaseLayer extends egret.Sprite {

    /**
     * 层id
     */
    public id: number;

    constructor(id: number) {
        super();
        this.id = +id;
    }
}

/**
 * UI使用的层级，宽度和高度设定为和stage一致
 * 
 * @export
 * @class UILayer
 * @extends {GameLayer}
 */
export class UILayer extends BaseLayer {
    $getWidth() {
        return egret.sys.$TempStage.stageWidth;
    }

    $getHeight() {
        return egret.sys.$TempStage.stageHeight;
    }
}


/**
 * 需要对子对象排序的层
 */
export class SortedLayer extends BaseLayer {
    $children: (egret.DisplayObject & IDepth)[]
    $doAddChild(child: egret.DisplayObject, index: number, notifyListeners: boolean = true): egret.DisplayObject {
        if ("depth" in child) {
            GameEngine.invalidateSort();
            return super.$doAddChild(child, index, notifyListeners);
        }
        else {
            throw new Error(`Only IDepth can be added to this LayerID(${this.id})`);
        }
    }

    /**
     * 进行排序
     */
    public sort() {
        //对子集排序

        doSort(this.$children, "depth");
    }

}
