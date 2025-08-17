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
type LocaleDateOpts = Record<"weekday"|"month"|"day"|"year"|"hour"|"minute"|"second",string> & {hour12?:boolean;};

type Entity<K extends string> = {
  id:any;
  cid:string;
  creator:ObjectId_|string|"_self_";
  createdOn:string|Date;
  updatedOn:string|Date;
  removedOn?:string|Date;
  statusUpdates:Status<K>[];
  status:K; 
  desc?:string;
  info?:MiscInfo;
  meta:any;
};
type DocEntity<K extends string> = Entity<K> & Document_;
type Collection<T,K extends string = ""> = {
  new:Partial<T>;
  items:{[k in K]:T[]};
  selected:Nullable<{id:string;i:number;item:T}>;
};
type DeletedEntity = {id:string;ok:AnyBoolean;};

type ReqValidationError = {msg:string;param:string;location:string;};
type ValidationErrors = {errors:ReqValidationError[]|Primitives};
type ErrorConfig = Partial<{
  type:string;
  message:string;
  msg:string;
  status:number;
  code:number|string;
  warning:boolean;
  src:string;
  info:MiscInfo;
} & ValidationErrors>;
type ErrorObj = Error & ErrorConfig & Omit<Entity<any>,"status"|"statusUpdates">;
type ErrorType = Error|ErrorObj|ValidationErrors;
type Errors<K extends string|undefined = undefined> = Enum<ErrorType,K>;

type MiscInfo = Primitives;
type Status<K extends string> = {name:K;time:string|Date;info?:MiscInfo;};
type HrsOfOperation = `${number}${"am"|"pm"} - ${number}${"am"|"pm"}`;
type PhoneNumber = `+${number}-${number}-${number}-${number}`;
type ZipCode = `${number}`;

type AddressObj = Partial<Record<"streetAddr"|"city"|"state"|"postal"|"country"|"info",string> & {loc:{type:"Point",coordinates:[number,number]}}>;
type MiscModelRef = {id:string;ref:string;};
type Attachment = {
  originDate:string|Date;
  originLoc:string|Date;
  originName:string;
  name:string;
  mimeType:|"pdf"|"doc"|"docx"|"png"|"jpg"|"jpeg"|"aud"|"wav"|"mov4";
  size:number;
  res:string;
  location:string;
};
type UploadResponse = {
  id:string,
  type:"upload",
  asset_folder:string,
  original_filename:string,
  original_date:Date,
  location:string,
  description:string,
  format:string,
  resource_type:string,
  bytes:number,
  secure_url:string,
  public_id:string,
  created_at:Date|string,
  time:Date,
};