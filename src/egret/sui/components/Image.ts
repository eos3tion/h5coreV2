import { ResQueueID } from "../../../core/res/Res";
import { TextureResource, TextureResourceOption } from "../../resource/TextureResource";
import { DynamicTexture } from "../../texture/TextureSheet";
import { ComponentWithEnable, addEnable } from "../core/Component";

/**
 * 图片
 * 外部加载
 * @pb 
 *
 */
export class Image extends egret.Bitmap implements TextureResourceOption {

	/**
	 * 资源唯一标识
	 */
	uri: string;
	/**
	 * 设置图片的加载列队优先级
	 */
	qid?: ResQueueID;

	noWebp?: boolean;

	sheetKey?: Key;

	sheetSize?: number;

	sheetPath?: Path2D;

	opt?: TextureResourceOption;

	constructor() {
		super();
		this.on(EgretEvent.ADDED_TO_STAGE, this.addedToStage, this);
		this.on(EgretEvent.REMOVED_FROM_STAGE, this.removedFromStage, this);
	}

	addedToStage() {
		if (this.uri) {
			let opt = this.getOpt();
			let res = TextureResource.get(this.uri, opt);
			if (res) {
				res.qid = this.qid;
				//先设置为占位用，避免有些玩家加载慢，无法看到图
				res.bind(this, this.placehoder, true);
			}
		}
		let texture = this.texture;
		if (texture && (texture as DynamicTexture).sheet) {
			this.$refreshImageData();
			this.$updateRenderNode();
		}
	}

	removedFromStage() {
		if (this.uri) {
			let opt = this.getOpt();
			let res = TextureResource.get(this.uri, opt);
			if (res) {
				res.loose(this);
			}
			this.texture = undefined;
		}
	}

	/**
	 * 设置资源标识
	 */
	public set source(value: string) {
		if (this.uri == value)
			return;
		this.removedFromStage();//解除资源绑定
		this.uri = value;
		if (value) {
			if (this.stage) {
				this.addedToStage();
			}
		}
		else {
			this.texture = undefined;
		}
	}

	/**
	 * 销毁图片
	 */
	public dispose() {
		this.removedFromStage();
		this.off(EgretEvent.ADDED_TO_STAGE, this.addedToStage, this);
		this.off(EgretEvent.REMOVED_FROM_STAGE, this.removedFromStage, this);
	}

	hasTexture() {
		return this.texture != this.placehoder;
	}

	getOpt() {
		let opt = this.opt;
		if (!opt) {
			this.opt = opt = {
				sheetKey: this.sheetKey,
				noWebp: this.noWebp,
				sheetSize: this.sheetSize,
				sheetPath: this.sheetPath
			}
		}
		return opt;
	}
}

export interface Image extends ComponentWithEnable { };

addEnable(Image);
