type obj = { [k: string]: any };

export type Changed<T> = { [K in keyof T]?: T[K] extends object ? Changed<T[K]> : boolean };
export default class ObjectHelper {
    public static compare<T extends obj>(old: T = {} as T, actual: T = {} as T): Changed<T> {
        const changed: obj = {};
        const keys = [...Object.keys(old), ...Object.keys(actual)].filter((e, i, s) => s.indexOf(e) === i);
        for (const k of keys) {
            const first = old[k];
            const second = actual[k];
            const type = typeof (first !== undefined ? first : second);
            const thereIsNull = first === null || second === null;
            if (type === "object" && !thereIsNull) {
                if (Array.isArray(first)) {
                    const hasDiff = first.some(x => !second.includes(x));
                    const isChanged = hasDiff ? true : second.some((x: string | number) => !first.includes(x));
                    if (isChanged) {
                        changed[k] = true;
                    }
                } else {
                    const c = ObjectHelper.compare(first, second);
                    if (Object.values(c).some(e => e !== false)) {
                        changed[k] = c;
                    }
                }
            } else {
                if (first !== second) {
                    changed[k] = true;
                }
            }
        }
        return changed as Changed<T>;
    }

    public static fillFrom<T extends obj>(to: T, from: T): T {
        for (const [k, v] of Object.entries(to)) {
            const fv = from[k];
            if (fv === undefined) {
                continue;
            }
            const type = typeof v;
            if (type === "object" && !Array.isArray(fv) && v !== null) {
                if (fv !== null) {
                    ObjectHelper.fillFrom(v, fv);
                }
                continue;
            }
            //@ts-ignore
            to[k] = fv;
        }
        return to;
    }

    public static entries<T extends object>(object: T): [keyof T, T[keyof T]][] {
        return Object.entries(object) as [keyof T, T[keyof T]][];
    }
}
