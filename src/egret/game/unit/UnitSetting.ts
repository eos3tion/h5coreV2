import { Creator } from "../../../core/utils/ClassUtils";
import { UModel } from "./UModel";

export class UnitSetting {

	/**
	 * 是否添加UI层
	 */
	hasUILayer = true;

	/**
	 * 是否添加Buff容器
	 */
	hasBuffLayer = true;

	/**
	 * 是否添加光环容器
	 */
	hasHaloLayer = true;

	/**
	 * 是否添加到游戏场景中
	 */
	addToEngine = true;

	modelRef: Creator<UModel>;

	//防止同一坐标的单位排序深度相同，出现闪烁的情况
	getDepth() {
		return this.depthA + Math.random() * this.depthB;
	}
	/**
	 * 深度的参数A
	 */
	depthA = 0;
	/**
	 * 深度的参数B
	 */
	depthB = 0.19;
}

/**
 * 默认的单位设置
 */
export const defaultUnitSetting = new UnitSetting();
