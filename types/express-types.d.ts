type IJWT = {
  exp:any;
  iat:any;
  iss:string;
  sub:string;
  type:"access"|"refresh"|"reset";//|"stream";
};
type IApiToken = {token:string;expires:Date};
type IApiTokens = Partial<Record<"access"|"refresh"|"reset",IApiToken>> & {csrf?:string;};
type IApiResponse<T = any> = {
  status:number;
  success:boolean;
  data:T;
  tokens:IApiTokens;
  message:string;
  useEnc:boolean|number;
};
type IApiQuery<T = any> = {
  query:Partial<Record<keyof T,any>>;
  opts?:Partial<Record<"limit"|"skip",number> & {sort:keyof T|`-${Keys<T>}`}>;
  select?:"json"|Keys<T>[];
};

interface IRequest extends Request_ {
  token:IAppCreds & IJWT;
  user:Document_ & Partial<IAppCreds>;
  profile:any;
  session:any;
  cvars:any;
  svars:any;
  device:any;
  file:any;
  upload:any;
  loc:[number,number];
}
interface IResponse extends Response_ {locals:IApiResponse}

type IHandler = (req:IRequest, res:IResponse, next:Next_) => void|Promise<void>;
type IErrorHandler = (err:Error, req:IRequest, res:IResponse, next:Next_) => void|Promise<void>;