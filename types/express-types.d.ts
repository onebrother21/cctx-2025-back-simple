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
}
type IHandler = (req:IRequest, res:Response_, next:Next_) => void|Promise<void>;
type IErrorHandler = (err:Error, req:IRequest, res:Response_, next:Next_) => void;