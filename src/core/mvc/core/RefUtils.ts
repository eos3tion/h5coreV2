const classMap = {} as { [className: string]: { new(): any } }

export const RefUtils = {
    reg<T>(className: string, ref: { new(): T }) {
        classMap[className] = ref;
    },
    get(className: string) {
        return classMap[className];
    }
}