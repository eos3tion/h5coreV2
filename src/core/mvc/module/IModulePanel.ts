import { ViewDele } from "../core/ViewDele";

/**
 * 模块面板
 * @author 
 *
 */
export interface IModulePanel extends ViewDele {

	/**
	 * 关联的模块ID
	 */
	moduleID: Key;

}