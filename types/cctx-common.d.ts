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

type StringQuery<K extends string> = Partial<Record<K,string|{$regex:string,$options:"i"}|{$in:string[]}>>;
type BooleanQuery<K extends string> = Partial<Record<K,boolean>>;
type NumberQuery<K extends string> = Partial<Record<K,Partial<Record<"$eq"|"$ne"|"$lt"|"$lte"|"$gt"|"$gte",number>>>>;
type PrimitiveQuery<K extends string> = StringQuery<K>|BooleanQuery<K>|NumberQuery<K>;

type GeoNearQueryPre = Partial<Record<"locQuery",{pts:[number,number],radius:number,unit:"mi"|"km"}>>;
type GeoNearQuery<K extends string> = Partial<Record<K,{$geoWithin:{$centerSphere:[[number,number],number]}}>>;
type MetaQuery<K extends string = "meta"> = Partial<{[k in `${K}.${string}`]:PrimitiveQuery<k>;}>;
type InfoQuery<K extends string = "info"> = Partial<{[k in `${K}.${string}`]:PrimitiveQuery<k>;}>;
type ObjectQuery<K extends string> = Partial<{[k in `${K}.${string}`]:PrimitiveQuery<k>;}>;
type LogicalQuery<T> = Partial<Record<"$and"|"$or",T[]>>;

type QueryTypes = "strings"|"booleans"|"numbers"|"dates"|"geoNear"|"any";
type QueryKeys = Partial<Record<QueryTypes,string>>;

type BasicQuery<K extends QueryKeys> =
StringQuery<K["strings"]>
& BooleanQuery<K["booleans"]>
& NumberQuery<K["numbers"]>
& NumberQuery<K["dates"]>
& GeoNearQuery<K["geoNear"]> & GeoNearQueryPre
& MetaQuery & InfoQuery & ObjectQuery<K["any"]>;
type StrongQuery<K extends QueryKeys> = BasicQuery<K> & LogicalQuery<BasicQuery<K>>;