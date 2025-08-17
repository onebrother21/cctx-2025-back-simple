import * as Profiles from "./profile.types";

export type IPin = `${Digit}${Digit}${Digit}${Digit}`;
export type IAuthToken = IRequest["token"] & {
  type:"access"|"refresh"|"reset"|"stream";
  userId:string;
  username:string;
  role:string;
};
export type IAuthEvents = "created"|"registered"|"verified"|"loggedout"|"loggedin"|"reset"|"updated";
export type IAuthActivity = Partial<Record<IAuthEvents,string|Date>>;
export type IAuthParams = {
  pin:IPin;
  reset:string|null;
  verification:string|null;
  verificationSent:Date;
  pushToken:string|null;
  socketId:string|null;
  // token:AuthToken|null;
  // scopes:string[];
  // activity:AuthActivity;
};