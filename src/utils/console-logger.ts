import { AppError } from "./common-models";
import * as Utils from "./common-utils";

type LogTypes = |"log"|"warn"|"error"|"info"|"ok"|"trace"|"reset"|"here"|"debug"|"maroon";
type ColorTypes = |"grey"|"red"|"green"|"yellow"|"blue"|"magenta"|"default"|"white";
type DefaultLogColors = Partial<Record<LogTypes,`\x1b[${number}m`|string>>;
const colors:DefaultLogColors = {
  error:"\x1b[91m",//red
  ok:"\x1b[92m",//green
  warn:"\x1b[93m",//yellow
  info:"\x1b[94m",//blue
  trace:"\x1b[95m",//magenta
  log:"\x1b[96m",//cyan
  here:"\x1b[34m",//darkblue
  debug:"\x1b[38:5:214m",//orange
  reset:"\x1b[39m",//default
};
const numOfLinesToDisgardInHere = 3;

const here_ = ():{functionName:string,fileInfo:string} => {
  const e = new AppError("just for here");
  const stack = e.stack || "";
  const firstAt = stack.indexOf("at ");
  const realStack = stack.slice(firstAt);
  const stackArr = realStack.split("at ").map(s => s.trim()).slice(1);
  const here = stackArr[numOfLinesToDisgardInHere];
  const parts = here.split(" ");
  const functionName = parts[0];
  const fileInfo = parts[1]?.replace("(","")?.replace(")","") || "";
  return {functionName,fileInfo};
};
const write = (k:LogTypes,...args:any[]):boolean => {
  try{
    const test = Utils.isEnv(["test"]);
    const verbose = Utils.isEnv("verbose");
    const okErrOrWarn = ["ok","error","warn"].includes(k);
    const iserror = k == "error";
    const isProd = Utils.isProd();
    const flag = `⚡️ [${k}]:`;
    const {functionName,fileInfo} = here_();
    const color = colors[k];
    const reset = colors.reset;
    const log = console.log.bind(console,color,flag,reset);
    const logHere = log.bind(console,functionName,fileInfo);
    switch(true){
      case isProd && !iserror:break;
      // case !test && !okErrOrWarn:break; 
      case isProd && !iserror:break;
      case k == "here":
      case verbose:logHere(...args);break;
      default:log(...args);break;
    }
  }
  catch(e){console.error(e);}
  return true;
};
export const print = (k:string,title:string,...args:any[]):boolean => {
  const K = k as keyof DefaultLogColors;
  const isProd = Utils.isProd();
  const flag = `⚡️ [${title}]:`;
  const color = colors[K];
  const reset = colors.reset;
  const log = console.log.bind(console,color,flag,reset);
  if(!isProd) log(...args);
  return true;
};
export const here = (silenceMsg?:boolean) => !silenceMsg?write("here"):null;
export const log = (...args:any[]) => print("log",args[0],...args);
export const info = (...args:any[]) => print("info",args[0],...args);
export const error = (...args:any[]) => print("error",args[0],...args);
export const warn = (...args:any[]) => print("warn",args[0],...args);
export const trace = (...args:any[]) => print("trace",args[0],...args);
export const ok = (...args:any[]) => print("ok",args[0],...args);
export const debug = (...args:any[]) => print("debug",args[0],...args);
export const clear = () => process.stdout.write("\x1Bc");