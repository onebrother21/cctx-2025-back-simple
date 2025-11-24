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
  verificationType:IContactMethods|null;
  verificationSent:Date|null;
  pushToken:string|null;
  socketId:string|null;
};