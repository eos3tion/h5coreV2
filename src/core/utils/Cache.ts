export function getCache<K extends number | string, T>() {
    let files = {} as { [key: string]: T };
    return {
        add(key: K, value: T) {
            files[key] = value;
        },
        get(key: K) {
            return files[key];
        },
        remove(key: K) {
            delete files[key];
        },
        clear() {
            files = {};
        }
    }
}

export type Cache = ReturnType<typeof getCache>;

export type MapperFunction = { (uri: string): string };
export function getMapper() {
    const map = getCache<string, string>();
    const mapFunctions = [] as MapperFunction[];
    return {
        get(uri: string): string {
            //这个写法太奇葩了，可能照成死循环
            //TODO 引入 `h5core`的Res那套逻辑
            for (let i = 0; i < mapFunctions.length; i++) {
                const newUri = mapFunctions[i](uri);
                if (newUri) {
                    return this.get(newUri);
                }
            }
            let newUri = map.get(uri);
            if (newUri) {
                return this.get(newUri);
            }

            return uri;
        },
        set(uri: string, uri2: string) {
            map.add(uri, uri2);
        },
    }
}

export type Mapper = ReturnType<typeof getMapper>;

export const Mapper = getMapper();