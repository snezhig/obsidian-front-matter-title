type obj = { [k: string]: any };

export type Changed<T> = { [K in keyof T]?: T[K] extends object ? Changed<T[K]> : boolean};
export default class ObjectHelper {
    public static compare<T extends { [k: string]: any }>(old: T, actual: T): Changed<T> {
        const changed: obj = {};
        for (const [k, v] of Object.entries(old)) {
            if (typeof v === "object") {
                if (Array.isArray(v)) {
                    const hasDiff = v.some(x => !actual[k].includes(x));
                    const isChanged = hasDiff ? true : actual[k].some((x: string | number) => !v.includes(x));
                    if(isChanged){
                        changed[k] = true;
                    }
                } else {
                    const c = ObjectHelper.compare(old[k], actual[k]);
                    if(Object.values(c).some(e => e !== false)){
                        changed[k] = c;
                    }
                }
            } else {
                if(v !== actual[k]){
                    changed[k] = true;
                }
            }
        }
        return changed as Changed<T>;
    }
}