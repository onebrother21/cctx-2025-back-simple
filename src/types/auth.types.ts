export type IPin = `${Digit}${Digit}${Digit}${Digit}`;
export enum IContactMethods {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in-app",
  AUTO = "auto",
}
export type IAuthToken = IRequest["token"] & {
  userId:string;
  username:string;
  role:string;
};
export type IAuthParams = {
  pin:IPin;
  reset:string|null;
  verification:string|null;
  pushToken:string|null;
  socketId:string|null;
  meta:Partial<{
    verificationType:IContactMethods|null;
    verificationSent:Date|null;
    resetType:IContactMethods|null;
    resetSent:Date|null;
    lastLogin:Date|null;
    lastLogout:Date|null;
    lastVerified:Date|null;
    lastReset:Date|null;
  }>;
};