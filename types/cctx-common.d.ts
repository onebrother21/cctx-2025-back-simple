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

type GeoNearQueryPre = Record<"locQuery",{pts:[number,number],radius:number,unit:"mi"|"km"}>;
type GeoNearQuery<K extends string> = Partial<Record<K,{$geoWithin:{$centerSphere:[[number,number],number]}}>>;
type MetaQuery<K extends string = "meta"> = Partial<{[k in `${K}.${string}`]:PrimitiveQuery<k>;}>;
type InfoQuery<K extends string = "info"> = Partial<{[k in `${K}.${string}`]:PrimitiveQuery<k>;}>;
type ObjectQuery<K extends string> = Partial<{[k in `${K}.${string}`]:PrimitiveQuery<k>;}>;
type LogicalQuery<T> = Partial<Record<"$and"|"$or",T[]>>;

type QueryTypes = "strings"|"booleans"|"numbers"|"dates"|"geoNear"|"any";
type QueryKeys = Partial<Record<QueryTypes,string>>;

type BasicQuery<K extends QueryKeys> =
(K["strings"] extends string?StringQuery<K["strings"]>:{})
& (K["booleans"] extends string?BooleanQuery<K["booleans"]>:{})
& (K["numbers"] extends string?NumberQuery<K["numbers"]>:{})
& (K["dates"] extends string?NumberQuery<K["dates"]>:{})
& (K["geoNear"] extends string?GeoNearQuery<K["geoNear"]>:{})
& (K["any"] extends string?ObjectQuery<K["any"]>:{})
& MetaQuery & InfoQuery & GeoNearQueryPre;
type StrongQuery<K extends QueryKeys> = BasicQuery<K> & LogicalQuery<BasicQuery<K>>;

type MiscModelRef = {id:string;ref:string;};
type Status<K extends string> = {name:K;time:string|Date;info?:MiscInfo;};
type LocaleDateOpts = Record<"weekday"|"month"|"day"|"year"|"hour"|"minute"|"second",string> & {hour12?:boolean;};
type HrsOfOperation = `${number}${"am"|"pm"} - ${number}${"am"|"pm"}`;
type PhoneNumber = `+${number}-${number}-${number}-${number}`;
type ZipCode = `${number}`;
type LocationObj = {loc:[number,number]};
type AddressObj = Partial<Record<"streetAddr"|"city"|"state"|"postal"|"country"|"info",string> & {loc:[number,number]}>;
type AddressResult = Pick<AddressObj,"info"|"loc">;
type MinutesToTheNearestFive = "00"|"05"|"10"|"15"|"20"|"25"|"30"|"35"|"40"|"45"|"50"|"55";
type Hours = 
|"01"|"02"|"03"|"04"|"05"|"06"|"07"|"08"|"09"|"10"|"11"|"12"
|"13"|"14"|"15"|"16"|"17"|"18"|"19"|"20"|"21"|"22"|"23"|"24";
type TimeToTheNearestFive = `${Hours}:${MinutesToTheNearestFive}`;