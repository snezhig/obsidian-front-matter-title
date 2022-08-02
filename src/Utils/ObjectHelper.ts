type obj = { [k: string]: any };

export type Changed<T> = { [K in keyof T]?: T[K] extends object ? Changed<T[K]>|false : boolean};
export default class ObjectHelper {
    public static compare<T extends { [k: string]: any }>(old: T, actual: T): Changed<T> {
        const changed: obj = {};
        for (const [k, v] of Object.entries(old)) {
            if (typeof v === "object") {
                if (Array.isArray(v)) {
                    const hasDiff = v.some(x => !actual[k].includes(x));
                    changed[k] = hasDiff ? true : actual[k].some((x: string | number) => !v.includes(x));
                } else {
                    const c = ObjectHelper.compare(old[k], actual[k]);
                    changed[k] = Object.values(c).some(e => e !== false) ? c : false;
                }
            } else {
                changed[k] = v !== actual[k];
            }
        }
        return changed as Changed<T>;
    }
}