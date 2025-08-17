declare type Request_ = import('express').Request;
declare type Response_ = import('express').Response;
declare type Next_ = import('express').NextFunction;
declare type Document_ = import('mongoose').Document;
declare type ObjectId_ = import('mongoose').Schema.Types.ObjectId;

interface IAppCreds {
  id:string;
  role:string;
  username:string;
  // appId:string;
  // appname:string;
}
interface IError extends Error {
  status:number;
  code?:string;
  info?:string;
  errors?:(string|Error|any)[];
}