import CryptoJS from "crypto-js";
import expressListRoutes from 'express-list-routes';
import { deepmerge } from "deepmerge-ts";
import * as logger from "./console-logger";

type sortArg<T> = keyof T | `-${string & keyof T}`;
const supersecret = process.env.ENCRYPTION_PUBLIC || "";
const overwriteMerge = (destinationArray:any[], sourceArray:any[], options:any) => sourceArray;

export var pkg = ():string => process.env["npm_package_name"];
export var app = ():string => /@/.test(pkg())?pkg().split("/")[1]:pkg();
export var varPrefix = ():string => (app().toLocaleUpperCase()).replace(/-/g,"_");
export var getvar = (str:string):any => parse(process.env[varPrefix() + str]);
export var env = ():string => process.env["NODE_ENV"];
export var mode = ():string => process.env["NODE_MODE"];
export var version = ():string => process.env["npm_package_version"];
export var stringify = (o:object) => JSON.stringify(o);
export var parse = (k:string) => {try {return JSON.parse(k);} catch(e){return k;}};
export var isProd = (o = false):o is boolean => process.env.NODE_ENV === "production";
export var is = <T>(o:T):o is T => !(o === undefined || o === null);
export var isMatch = (test:RegExp|string[],...a:string[]):boolean => {
  for(let i = 0;i<a.length;i++){
    switch(true){
      case isArr(test) && test.length && test.indexOf(a[i]) > -1:return true;
      case (test as RegExp).test(a[i]):return true;
      case i == a.length - 1:return false;
      default:break;
    }
  }
  return false;
};
export var isStr = (o:string|any):o is string => typeof o == "string";
export var isNum = (o:number|any):o is number => typeof o == "number";
export var isNumericStr = (s:string) => /^\d+$/.test(s) && typeof Number(s) === "number";
export var isBool = (o:boolean|any):o is boolean => typeof o == "boolean";
export var isArr = <T>(o:T[]|any):o is T[] => Array.isArray(<T[]>o);
export var isObj = (o:{}|any):o is object => !isArr(o) && !isFunc(o) && typeof o === "object";
export var isFunc = (o:Function|any):o is Function => typeof (<Function>o) == "function";
export var isErr = (o:Error|any):o is Error => o instanceof Error;
export var isDate = (o:Date|any):o is Date => o instanceof Date || isISODateStr(o);
export var isDateString = (s:string) => {
  try{
    return typeof new Date(s).getTime === 'function';
  }
  catch(e){
    return false;
  }
};
export var isType = <T extends any,U extends Constructor<T>>(o:any,c:U):o is T => o instanceof c;
export var isEmpty = (o:any|any[]) => {
  if(o === undefined || o === null) return true;
  if(isObj(o)) return !Object.keys(o).length;
  if(isArr(o)) return !o.length;
  else throw(`global "empty" called on non-array or non-object`);
};
export var isCtr = <T>(o:any|Constructor<T>):o is Constructor<T> => isFunc((new o));//incorrect implementation
export var isInstance = <T,U extends Constructor<T> = Constructor<T>>(o:any|T,ctr:U):o is T => o instanceof ctr;
export var isEnv = (envs:string|string[]) => {
  const env = process.env.NODE_ENV.toLocaleLowerCase();
  if(isArr(envs)){
    for(let i = 0,l = envs.length;i<l;i++){
      const r = new RegExp(envs[i]);
      if(r.test(env)) return true;
    }
    return false;
  }
  else return new RegExp(envs).test(env);
};
export var notEmpty = (o:any|any[]) => !isEmpty(o);
export var randomNumber = (min:number,max:number) => Math.floor(Math.random() * (max - min + 1) + min);
export var generateSixDigitCode = ():string => {
  // Generate a random number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000);
  // Convert the number to a string and pad with leading zeroes if necessary
  return code.toString().padStart(6, '0');
}
export var S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);
export var longId = () => S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4();
export var shortId = () => S4()+S4();
export var hexId = (length:number) => {
  const hexChars = '0123456789abcdef';
  let hexString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * hexChars.length);
    hexString += hexChars[randomIndex];
  }

  return hexString;
}
export var slugify = (str:string,separator:string = "-") => {
  str = str.toLowerCase().trim().slice(0,19);
  // remove accents, swap ñ for n, etc
  const from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
  const to = "aaaaaaeeeeiiiioooouuuunc------";
  for (let i = 0,l = from.length;i < l;i++) {
    str = str.replace(new RegExp(from.charAt(i),"g"),to.charAt(i));
  }
  return str
  .replace(/[^a-z0-9 -]/g,"") // remove invalid chars
  .replace(/\s+/g,"-") // collapse whitespace and replace by -
  .replace(/-+/g,"-") // collapse dashes
  .replace(/^-+/,"") // trim - from start of text
  .replace(/-+$/,"") // trim - from end of text
  .replace(/-/g,separator);
};
export var slugId = (s:string) => slugify(s) + "-" + S4() + S4();
export var cap = (s:string,all?:boolean) => all?s.toUpperCase():(s[0].toUpperCase()+s.slice(1));
export var low = (s:string,all?:boolean) => all?s.toLowerCase():(s[0].toLowerCase()+s.slice(1));
export var snake = (s:string) => {
  let newStr = "";
  for(let i =0;i<s.length;i++){
    newStr += !i?s[i].toLowerCase():
    /[A-Z]/.test(s[i])?("-"+s[i].toLowerCase()):s[i];}
  return newStr;
};
export var capWSpaces = (s:string) => {
  let parts = s.split(" ");
  parts = parts.map(p => p[0].toLocaleUpperCase() + p.slice(1))
 return parts.join(" ");
};
export var replaceData = (str:string,data:any = {}) => {
  const dataReplacer = (withDelimiters:string,withoutDelimiters:string):string =>
  data.hasOwnProperty(withoutDelimiters)?
  data[withoutDelimiters]:
  withDelimiters;
  return str.replace(/{(\w+)}/g,dataReplacer);
};
export var oProps = (o:{}|any) => {
  if(isObj(o)) return Object.keys(o);
  else throw `global "props" called on non-object`;
};
export var oHas = (o:any[]|{}|any,k:string) => {
  if(isArr(o)) return o.indexOf(k) > -1;
  if(isObj(o)) return oProps(o).indexOf(k) > -1;
  else throw `global "has" called on non-array or non-object`;
};
export var merge = <T>(x:Partial<T>,y:Partial<T>) => deepmerge(x,y,{arrayMerge:overwriteMerge}) as T;
export var dateParserX = (str:string|Date):Date => {
  if(str instanceof Date) return str;
  else if(new Date(str) instanceof Date) return new Date(str);
  else{
    //format should be dd/mm/yyyy. Separator can be anything e.g. / or -. It wont effect
    const day   = parseInt(str.substring(0,2));
    const month  = parseInt(str.substring(3,5));
    const yr   = parseInt(str.substring(6,10));
    const date = new Date(yr,month - 1,day);
    return date;
  }
};
export var splitCamelCase = (s:string) => s.replace(/([a-z](?=[A-Z]))/g,'$1 ');
export var sleep = (t:number) => new Promise((resolve) => setTimeout(resolve, t * 1000));
export var byPropertiesOf = <T extends object> (sortBy: Array<sortArg<T>>) => {
  function compareByProperty (arg: sortArg<T>) {
    let key: keyof T
    let sortOrder = 1
    if (typeof arg === 'string' && arg.startsWith('-')) {
      sortOrder = -1
      // Typescript is not yet smart enough to infer that substring is keyof T
      key = arg.slice(1) as keyof T
    } else {
      // Likewise it is not yet smart enough to infer that arg here is keyof T
      key = arg as keyof T
    }
    return function (a: T, b: T) {
      const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
      return result * sortOrder
    }
  }
  return function (obj1: T, obj2: T) {
    let i = 0
    let result = 0
    const numberOfProperties = sortBy?.length
    while (result === 0 && i < numberOfProperties) {
      result = compareByProperty(sortBy[i])(obj1, obj2)
      i++;
    }
    return result
  }
};
export var sort = <T extends object> (arr: T[], ...sortBy: Array<sortArg<T>>) => {
  arr.sort(byPropertiesOf<T>(sortBy));
};
export var sortBy = (key:string, reverse?:true|false|1|0|null) => {
  const moveSmaller = reverse ? 1 : -1;
  const moveLarger = reverse ? -1 : 1;
  return (a:any, b:any) => {
    if(!(a[key] && b[key])) return 0;
    if (a[key] < b[key]) {
      return moveSmaller;
    }
    if (a[key] > b[key]) {
      return moveLarger;
    }
    return 0;
  };
};
export var getFileInfoFromException = (e:Error):any => {
  const {stack} = e;
  if (!stack) return {};
  const match = /.*\n\s*at\s.*\s\((.*\/)*(.*):([\d]*):([\d]*)/.exec(stack);
  if (!match) return {};
  const o:any = {
      file: match[1],
      line: Number(match[2]),
      column: Number(match[3]),
  };
  o.str = `${o.file}, Line ${o.line}:${o.column}`;
  return o;
};
export var padDigits = (number:number, digits:number) => {
  return Array(Math.max(digits - String(number).length + 1,0)).join("") + number;
};
export var getRandomIntInclusive = (min:number, max:number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};
export var padNumber = (num:number, size:number) => {return String(num).padStart(size, '0');};
/*
export var areDateRangesEqual (range1:DateRange, range2:DateRange): boolean => {
  return (
    areDatesEqual(new Date(range1.from),new Date(range2.from)) &&
    areDatesEqual(new Date(range1.to),new Date(range2.to))
  );
};
*/
export var areDatesEqual = (date1: Date,date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};
export var isDateWithinInterval = (interval:string,targetDate:Date): boolean => {
  const now = new Date();
  const futureDate = new Date(now);

  // Extract the number and the unit (d, m, y)
  const match = interval.match(/^(\d+)([dmy])$/);
  if (!match) throw new Error("Invalid interval format. Use 'Xd', 'Xm', or 'Xy'.");

  const value = parseInt(match[1], 10);
  const unit = match[2];

  // Adjust future date based on the interval
  switch (unit) {
      case 'd':
          futureDate.setDate(now.getDate() + value);
          break;
      case 'm':
          futureDate.setMonth(now.getMonth() + value);
          break;
      case 'y':
          futureDate.setFullYear(now.getFullYear() + value);
          break;
      default:
          throw new Error("Invalid interval unit. Use 'd' for days, 'm' for months, or 'y' for years.");
  }

  // Check if targetDate falls between now and the futureDate
  return targetDate >= now && targetDate <= futureDate;
}
export var coerceToMidnight = (o?:Date): Date => {
  if(o){
    const date = new Date(o);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  else {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
};
export var dateAM = coerceToMidnight;
export var isEighteenOrOlder = (dob:Date) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {age--;}
  const isOldEnough = age >= 18;
  if (!isOldEnough) throw new Error('Users must be 18 or older');
  return true;
};
export var getHtmlTableType = (k:string,p:any) => {
  switch(true){
    case p === undefined:
    case p === null:
    case typeof p === "string" && p === "":return "no-value";
    case typeof p === "boolean":return "yes-no";
    case Array.isArray(p):return !p.length?"arr-empty":"arr";
    case /\b\w*?(img|image|pic)\w+\b/.test(k):return "img";
    case typeof p === "string" && isNumericStr(p):return "text";
    //case typeof p === "string" && isDateString(p):
    case isDate(p):return "date-time";
    case typeof p === "number":
    case typeof p === "string":return "text";
    default:return "object";
  }
}
export var isISODateStr = (s:string) => {
  /* eslint-disable max-len */
  // from https://www.myintervals.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
  const iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
  // same as above, except with a strict 'T' separator between date and time
  const iso8601StrictSeparator = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
  /* eslint-enable max-len */
  const isValidDate = (str:string) => {
    // str must have passed the ISO8601 check
    // this check is meant to catch invalid dates
    // like 2009-02-31
    // first check for ordinal dates
    const ordinalMatch = str.match(/^(\d{4})-?(\d{3})([ T]{1}\.*|$)/);
    if(ordinalMatch) {
      const oYear = Number(ordinalMatch[1]);
      const oDay = Number(ordinalMatch[2]);
      // if is leap year
      if ((oYear % 4 === 0 && oYear % 100 !== 0) || oYear % 400 === 0) return oDay <= 366;
      return oDay <= 365;
    }
    const matchO = str.match(/(\d{4})-?(\d{0,2})-?(\d*)/);
    if(matchO){
      const match = matchO.map(Number);
      const year = match[1];
      const month = match[2];
      const day = match[3];
      const monthString = month ? `0${month}`.slice(-2) : month;
      const dayString = day ? `0${day}`.slice(-2) : day;
      // create a date object and compare
      const d = new Date(`${year}-${monthString || '01'}-${dayString || '01'}`);
      if (month && day) {
        return d.getUTCFullYear() === year
          && (d.getUTCMonth() + 1) === month
          && d.getUTCDate() === day;
      }
      return true;
    }
    return false;
  };
  const isISO8601 = (str:string, options:{strict?:boolean,strictSeparator?:string} = {}) => {
    const check = options.strictSeparator ? iso8601StrictSeparator.test(str) : iso8601.test(str);
    if (check && options.strict) return isValidDate(str);
    return check;
  }
  return isISO8601(s);
}
export var flattenObject = (obj:any, parentKey:string = '', result:any = {}) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}
export var jsonFormatter = {
  stringify: function(cipherParams:any){
    let ct = "",iv = "",s = "";
    ct = cipherParams.ciphertext.toString(CryptoJS.enc.Base64);
    if(cipherParams.iv) iv = cipherParams.iv.toString();
    if(cipherParams.salt) s = cipherParams.salt.toString();
    return iv+"\\"+ct+"\\"+s;
  },
  parse: function(jsonStr:string) {
    const [iv,ct,s] = jsonStr.split("\\");
    const cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(ct)});
    if(iv) cipherParams.iv = CryptoJS.enc.Hex.parse(iv);
    if(s) cipherParams.salt = CryptoJS.enc.Hex.parse(s);
    return cipherParams;
  }
};
export var encrypt_ = (value:any) => {
  const options = {format:jsonFormatter,mode:CryptoJS.mode.CBC};
  const encrypted = CryptoJS.AES.encrypt(value,supersecret,options).toString();
  return encrypted;
};
export var decrypt_ = (value:any) => {
  const options = {format:jsonFormatter};
  const decrypted = CryptoJS.AES.decrypt(value,supersecret,options).toString(CryptoJS.enc.Utf8);
  return decrypted;
}
export var encrypt = (o:any) => encrypt_(JSON.stringify(o));
export var decrypt = (o:any) => JSON.parse(decrypt_(o));

export var listRoutes = (app:Express.Application) => {
  const routes = expressListRoutes(app,{
    prefix: '', // A prefix for router Path
    spacer: 7,   // Spacer between router Method and Path
    logger:false, // A custom logger function or a boolean (true for default logger, false for no logging)
    color: true // If the console log should color the method name
  });
  logger.info("App Routes: ",routes);
};