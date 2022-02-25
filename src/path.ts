type UnknownRecord = { [x: PropertyKey]: unknown };

export type Path = PropertyKey | readonly PropertyKey[] | [];

type SplitDot<T extends string> = (
    T extends `${infer U}.${infer Rest}` ? [U, ...SplitDot<Rest>]
    : string extends T ? string[]
    : [T]
);

export type ParsePath<P extends Path> = (
    P extends readonly PropertyKey[] ? P
    : P extends string ? SplitDot<P>
    : [P]
);

export const parsePath = (path: Path): PropertyKey[] => (
    typeof path === "string" ? path.split(".")
    : typeof path === "number" || typeof path === "symbol" ? [path]
    : path.slice() // clone
);

export type Get<O, P extends readonly PropertyKey[]> = (
    P extends readonly [infer K, ...infer Rest]
        ? Get<
            O extends { readonly [_ in Extract<K, PropertyKey>]: infer V } ? V
            : O extends { readonly [_ in Extract<K, PropertyKey>]?: infer V } ? V | undefined
            : undefined,
            Extract<Rest, PropertyKey[]>
        >
        : O
);

const anyGet = (obj: any, key: PropertyKey) => obj?.[key];

export const get = <O, P extends Path>(root: O, path: P): Get<O, ParsePath<P>> =>
    parsePath(path).reduce<O | undefined>(anyGet, root) as Get<O, ParsePath<P>>;

export const set = <P extends Path, V>(root: Obj<ParsePath<P>, V>, path: P, value: V) => {
    const keyRoute = parsePath(path);
    if(keyRoute.length === 0) {
        return;
    }
    const key = keyRoute.pop()!;
    const obj = get(root, keyRoute);
    if(obj != null && typeof obj === "object" || typeof obj === "function") {
        (obj as UnknownRecord)[key] = value;
    }
};

export type Obj<P extends readonly PropertyKey[], V> = (
    P extends readonly [infer K, ...infer Rest]
        ? K extends PropertyKey
            ? { [_ in K]: Obj<Extract<Rest, PropertyKey[]>, V> }
            : never
        : V
);

const anyObj = (obj: UnknownRecord, key: PropertyKey) => (obj[key] = {});

export const obj = <P extends Path, V>(path: P, value: V): Obj<ParsePath<P>, V> => {
    const keyRoute = parsePath(path);
    if(keyRoute.length === 0) {
        return value as Obj<ParsePath<P>, V>;
    }
    const setKey = keyRoute.pop()!;
    const root = {};
    const setObj = keyRoute.reduce<UnknownRecord>(anyObj, root);
    setObj[setKey] = value;
    return root as Obj<ParsePath<P>, V>;
};
