import { DisplayObject } from "./DisplayObject";
import { Event } from "../../../node_modules/three/src/core/Face3";
import { Batcher } from "./Batcher";


function removeChildAt(child: DisplayObject, children: DisplayObject[], index: number) {
    child.parent = null;
    children.splice(index, 1);
    child.dispatchEvent({ type: EventConst.Removed, local: true });
}

export class DisplayObjectContainer extends DisplayObject {
    children: DisplayObject[];

    get numChildren() {
        return this.children.length;
    }

    addChild(child: DisplayObject) {
        if (!child) {
            return;
        }
        let parent = child.parent;
        if (parent == this) {
            this.setChildIndex(child, this.children.length - 1);
        } else {
            if (parent) {
                parent.removeChild(child);
            }
            this.children.push(child);
            child.parent = this;
            child.dispatchEvent({ type: EventConst.Added, local: true });
        }
        return child;
    }

    addChildAt(child: DisplayObject, index: number) {
        if (!child) {
            return
        }
        index = +index | 0;
        const children = this.children;
        let numChildren = children.length;
        let parent = child.parent;
        if (index < 0 || index >= numChildren) {
            index = numChildren;
            if (parent == this) {
                index--;
            }
        }
        if (parent) {
            if (parent == this) {
                return this.setChildIndex(child, index);
            } else {
                parent.removeChild(child);
            }
        }
        child.parent = this;
        children.splice(index, 0, child);
        child.dispatchEvent({ type: EventConst.Added, local: true });
    }

    removeChild(child: DisplayObject) {
        const children = this.children;
        let index = children.indexOf(child);
        if (index > -1) {
            removeChildAt(child, children, index);
        }
        return child;
    }

    removeChildAt(index: number) {
        const children = this.children;
        if (index >= 0 && index < children.length) {
            let child = children[index];
            removeChildAt(child, children, index);
            return child;
        }
    }

    removeChildren() {
        const children = this.children;
        for (let i = children.length - 1; i >= 0; i--) {
            removeChildAt(children[i], children, i);
        }
    }

    getChildIndex(child: DisplayObject) {
        return this.children.indexOf(child);
    }


    setChildIndex(child: DisplayObject, index: number) {
        index = +index | 0;
        const children = this.children;
        let numChildren = children.length;
        if (index < 0 || index >= numChildren) {
            index = numChildren - 1;
        }
        let lastIndex = children.indexOf(child);
        if (lastIndex == index) {
            return;
        }
        if (lastIndex > -1) {
            if (index > lastIndex) {
                for (let i = lastIndex; i < index; i++) {
                    children[i] = children[i + 1];
                }

            } else {
                for (let i = lastIndex; i > index; i--) {
                    children[i] = children[i - 1];
                }
            }
            children[index] = child;
        } else {
            this.addChildAt(child, index);
        }
        return child;
    }

    contains(display: DisplayObject) {
        while (display) {
            if (display == this) {
                return true;
            } else {
                display = display.parent;
            }
        }
        return false;
    }

    swapChildren(child1: DisplayObject, child2: DisplayObject) {
        const children = this.children;
        let idx1 = children.indexOf(child1);
        let idx2 = children.indexOf(child2);
        if (idx1 > -1 && idx2 > -1) {
            children[idx1] = child2;
            children[idx2] = child1;
        }
        //else TODO 打印错误
    }

    getChildAt(index: number) {
        return this.children[index];
    }

    getChildByName(name: string) {
        let children = this.children;
        let length = children.length;
        for (let i = 0; i < length; i++) {
            let child = children[i];
            if (child.name == name) {
                return child;
            }
        }
    }

    dispatchEvent(event: Event) {
        if (!event.local) {
            const children = this.children.slice();
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                child.dispatchEvent(event);
                if (event.stop) {
                    return;
                }
            }
        }
        super.dispatchEvent(event);
    }

    render(batch: Batcher) {
        const children = this.children;
        const len = children.length;
        if (len > 0 && this.visible && this.alpha > 0) {
            for (let i = 0; i < len; i++) {
                const child = children[i];
                if (child.visible) {
                    const tint = child.tint;
                    if (tint.a > 0) {
                        batch.pushColor();
                        batch.pushMatrix();
                        batch.prependColor(tint);
                        batch.prependMatrix(child.getMatrix());
                        child.render(batch);
                        batch.popMatrix();
                        batch.popColor();
                    }
                }
            }
        }
    }
}