export interface AppError extends IError {}
export class AppError extends Error {
  constructor();
  constructor(o: string);
  constructor(o: number);
  constructor(o: Partial<AppError>);
  constructor(o: number,p: string);
  constructor(o: string,p: Partial<AppError>);
  constructor(o: number,p: Partial<AppError>);
  constructor(o?:string|number|Partial<AppError>,p?:string|Partial<AppError>){
    let err;
    switch(true){
      case typeof o === "undefined":err = {status:500,message:"Oops, something went wrong!"};break;
      case typeof o === "object" && !!o.status && !!o.message:err = {...o};break;
      case typeof o === "string" && !p:err = {status:500,message:o};break;
      case typeof o === "number" && !p:err = {status:o,message:"Oops, something went wrong!"};break;
      case typeof o === "number" && typeof p == "string":err = {status:o,message:p};break;
      case typeof o === "number" && typeof p == "object":err = {status:o,...p};break
      case typeof o === "string" && typeof p == "object":err = {message:o,...p};break
    }
    super(err.message);
    Object.assign(this,err);
    return this;
  }
  json(){
    return {
      message:this.message,
      name:this.name,
      status:this.status,
      ...this.code?{code:this.code}:null,
      ...this.info?{info:this.info}:null,
      ...this.errors?{errors:this.errors}:null,
    };
  }
} 