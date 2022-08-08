type obj = { [k: string]: any };

export type Changed<T> = { [K in keyof T]?: T[K] extends object ? Changed<T[K]> : boolean};
export default class ObjectHelper {
    public static compare<T extends { [k: string]: any }>(old: T = {} as T, actual: T = {} as T): Changed<T> {
        const changed: obj = {};
        const keys = [...Object.keys(old), ...Object.keys(actual)].filter((e,i,s) => s.indexOf(e) === i);
        for (const k of keys) {
            const first = old[k];
            const second = actual[k];
            const type = typeof (first !== undefined ? first : second);
            if (type === "object") {
                if (Array.isArray(first)) {
                    const hasDiff = first.some(x => !second.includes(x));
                    const isChanged = hasDiff ? true : second.some((x: string | number) => !first.includes(x));
                    if(isChanged){
                        changed[k] = true;
                    }
                } else {
                    const c = ObjectHelper.compare(first, second);
                    if(Object.values(c).some(e => e !== false)){
                        changed[k] = c;
                    }
                }
            } else {
                if(first !== second){
                    changed[k] = true;
                }
            }
        }
        return changed as Changed<T>;
    }
}