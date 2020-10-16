import { IRecyclable } from "../utils/ClassUtils";


/**
 * 用于发送的网络数据<br/>
 * @author 3tion
 */
export class NetSendData implements IRecyclable {
	/**
	 * 协议号
	 */
	public cmd = 0;

	/**
	 * 数据
	 */
	public data: any = null;

	/**
	 * 
	 * protobuf message的类型
	 */
	public msgType: Key = null;

	public onRecycle() {
		this.data = null;
		this.msgType = null;
	}
}
/**
 * 网络数据，类似AS3项目中Stream<br/>
 * @author 3tion
 *
 */
export class NetData extends NetSendData {

	/**
	 *  是否停止传播
	 */
	stopPropagation = false;
}