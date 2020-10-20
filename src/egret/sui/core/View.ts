import { addEnable, ComponentWithEnable } from "./Component";
import { createSuiComponents } from "./SuiResManager";

export class View extends egret.Sprite {
    public constructor(key: string, className: string) {
        super();
        this.suiClass = className;
        this.suiLib = key;
        createSuiComponents(key, className, this);
    }
}

export interface View extends ComponentWithEnable { };

addEnable(View);
