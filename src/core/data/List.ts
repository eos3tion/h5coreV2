export interface ListData<T> {
    data?: T;
    next?: ListData<T>;
    previous?: ListData<T>;
}

function nodeFromPool<T>(list: List<T>, data: T) {
    let a = list.pool;
    if (a) {
        list.pool = a.next;
        a.previous = a.next = null;
        a.data = data;
        return a;
    } else {
        return {
            data,
            previous: null as ListData<T>,
            next: null as ListData<T>,
        }
    }
}

function nodeToPool<T>(list: List<T>, a: ListData<T>) {
    a.data = a.previous = null;
    a.next = list.pool;
    list.pool = a;
}
export class List<T> {
    head: ListData<T> = null;
    tail: ListData<T> = null;
    pool: ListData<T> = null;

    add(data: T) {
        let self = this;
        let node = nodeFromPool<T>(self, data);
        let tail = self.tail;
        if (tail) {
            tail.next = node;
            node.previous = tail;
            self.tail = node;
        } else {
            self.head = self.tail = node;
        }
        return node;
    }

    pop() {
        let self = this;
        let tail = self.tail;
        if (tail) {
            let b = tail.data;
            self.removeNode(self.tail);
            return b;
        }
    }

    shift() {
        let self = this;
        let head = self.head;
        if (head) {
            self.removeNode(head);
            return head
        }
    }

    removeNode(node: ListData<T>) {
        let self = this;
        let head = self.head;
        if (head === node) {
            self.head = head.next;
        }
        let tail = self.tail;
        if (tail === node) {
            self.tail = tail.previous;
        }
        let previous = node.previous;
        if (previous) {
            previous.next = node.next;
        }
        let next = node.next;
        if (next) {
            next.previous = node.previous;
        }
        nodeToPool(self, node);
    }

    /**
     * 找到第一个`filter`返回`truthy`的数据
     * @param filter 
     */
    find(filter: { (data: T): any }) {
        let head = this.head;
        while (head) {
            let data = head.data;

            if (filter(data)) {
                return head;
            }

            head = head.next;
        }
    }

}