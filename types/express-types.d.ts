interface IRequest extends Request_ {
  token:{
    exp:any;
    iat:any;
    iss:string;
    sub:string;
    type:"access"|"refresh"|"reset"|"stream";
  };//expiresAt issuedAt issuer subject type
  user:Document_ & Partial<IAppCreds>;
  profile:any;
  session:any;
  bvars:any;
  device:any;
  file:any;
  upload:any;
  loc:[number,number];
}
type IApiQuery<T = any> = {
  query:Partial<Record<keyof T,any>>;
  opts?:Partial<Record<"limit"|"skip",number> & {sort:keyof T|`-${Keys<T>}`}>;
  select?:"json"|Keys<T>[];
};
type IAuthToken = {token:string;expires:Date};
type IApiTokens = Partial<Record<"access"|"refresh"|"reset",IAuthToken>> & {csrf?:string;};
type IApiResponse<T = any> = {
  status:number;
  success:boolean;
  data:T;
  message?:string;
  tokens?:IApiTokens|null;
};
type IHandler = (req:IRequest, res:Response_ & {locals:IApiResponse}, next:Next_) => void|Promise<void>;
type IErrorHandler = (err:Error, req:IRequest, res:Response_ & {locals:IApiResponse}, next:Next_) => void;