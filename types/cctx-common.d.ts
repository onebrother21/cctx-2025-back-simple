type Digit = "0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9";
type Constructor<T> = new (...args:any[]) => T;
type DeepPartial<T> = {[P in keyof T]?:DeepPartial<T[P]>;};
type DeepPartialExcept<T,K extends keyof T> = DeepPartial<T> & Pick<T,K>;

type AnyBoolean = boolean|1|0|null;
type Nullable<T> = T|null;
type Newable<T> = { new (...args: any[]): T; };

type Keys<T> = Extract<keyof T,string>;
type Values<T> = {[k in keyof T]:T[k]}[keyof T];

type Primitive = string|number|boolean|Date|Error;
type PrimitiveArr = Primitive[];
interface Primitives {[key:string]:Primitive|PrimitiveArr|Primitives|Primitives[];}
type DataMap<T> = {[key:string]:T};
type Enum<T,K extends string|undefined = undefined,J extends string|undefined = undefined> =
(K extends string?Record<K,T>:DataMap<T>) &
(J extends string?Partial<Record<J,T>>:{});
type Strings<K extends string|undefined = undefined> = Enum<string,K>;
type Numbers<K extends string|undefined = undefined> = Enum<number,K>;
type Bools<K extends string|undefined = undefined> = Enum<boolean,K>;
type Method<T> = (...params:any[]) => T;
type Methods<T> = DataMap<Method<T>>;
type TypedMethod<T,U> = (...params:(T|any)[]) => U;
type TypedMethods<T,U> = DataMap<TypedMethod<T,U>>;
type MiscInfo = Primitives;