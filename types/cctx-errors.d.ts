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
type ErrorObj = Error & ErrorConfig & Omit<Entity,"status">;
type ErrorType = Error|ErrorObj|ValidationErrors;
type Errors<K extends string|undefined = undefined> = Enum<ErrorType,K>;