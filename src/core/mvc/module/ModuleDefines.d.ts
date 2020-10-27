

/**
 * 限制检查器的基类
 * @author 3tion
 *
 */
declare interface ILimitChecker {
	/**
	 * 是否通过检查
	 * @param data		数据
	 * @param showtip	是否显示tip
	 * @return
	 *
	 */
	check(data: any, showtip: boolean): boolean
}

/**
 * 模块检测器 
 * @author 
 *
 */
declare interface IModuleChecker extends ILimitChecker {

	/**
	 * 检查并修正显示限制和使用限制值配错的情况
	 * @param	{any}	showLimits		显示限制的数据
	 * @param	{any}	limits			使用限制的数据
	 * @return	{boolean}   <br/>true 有配置错误<br/>false 无配置错误
	 */
	adjustLimitDatas(showLimits: any, limits: any): boolean;

}


/**
 * 模块配置数据
 * @author 3tion
 *
 */
declare interface IModuleCfg {
	/**
	 *id
	 */
	id: string | number;
	/**
	 * 模块对应面板，放置的容器标识
	 */
	containerID: number;
	/**
	 * 当前显示状态
	 */
	showState: ModuleShowState;
	/**
	 * 服务器认为此功能开放
	 */
	serverClose: boolean;
	/**
	 * 显示类型
	 */
	showtype: number;
	/**
	 * 显示限制数据
	 */
	showlimits: any[];
	/**
	 * 功能使用限制
	 */
	limittype: number;
	/**
	 * 使用限制数据
	 */
	limits: any[];
	/**
	 *执行类型
	 */
	type: number;
	/**
	 *参数1
	 */
	data1: any;
	/**
	 *参数2
	 */
	data2: any;
	/**
	 *参数3
	 */
	data3: any;
	/**
	 *参数4
	 */
	data4: any;
	/**
	 *模块名字
	 */
	name: string;
	/**
	 * 描述
	 */
	des: string;
	/**
	 * 是否关闭此功能（不开放）  
	 * 0/不填 正常开放  
	 * 1 暂未开放  
	 * 2 不开放/不显示按钮  
	 *   
	 */
	close: ModuleCloseState;

	/**
	 * 当模块开启时绑定的回调函数
	 */
	onOpen?: import("../../utils/Callback").$Callback[];

	/**
	 * 当模块显示时绑定的回调函数
	 */
	onShow?: import("../../utils/Callback").$Callback[];
}

declare const enum ModuleCloseState {
	/**
	 * 正常开放
	 */
	Open = 0,
	/**
	 * 即将开放
	 */
	ComingSoon = 1,
	/**
	 * 关闭的
	 */
	Closed = 2
}

/**
 * 模块tip状态
 */
declare const enum ModuleTipState {
	/**
	 * 即将开放
	 */
	ComingSoon = 1,
	/**
	 * 关闭的
	 */
	Closed = 2
}

/**
 * 模块面板的显示状态
 */
declare const enum ModuleShowState {
	/**
	 * 不在舞台上
	 */
	HIDE = 0,
	/**
	 * 正在显示，做Tween中
	 */
	SHOWING = 1,
	/**
	 * 已经显示在舞台上
	 */
	SHOW = 2,
	/**
	 * 正在隐藏
	 */
	HIDING = 3
}


interface ModuleHandler {

	/**
	 * 打开某个模块
	 * @param cfg
	 */
	show(cfg: IModuleCfg, param?: ModuleParam): any;


	/**
	 * 重舞台移除某个模块
	 * @param cfg
	 *
	 */
	hide(cfg: IModuleCfg, param?: ModuleParam): any;
}

/**
 * 模块参数
 * 
 * @export
 * @interface ModuleParam
 */
interface ModuleParam {

}