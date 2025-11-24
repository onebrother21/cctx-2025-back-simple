export enum IAppDeviceStatuses {
  NEW = "new",
}
export type AppDevice = DocEntity & {
  height:number;
  width:number;
  ua:string;
  mobile:boolean;
  browser:{
    name: string,
    version: string,
    major: string,
    type: string,
  };
  device:{ type: string, model: string, vendor: string };
  engine:{ name: string, version: string };
  os:{ name: string, version: string };
  socket:string;
  addrs:string[];
  lastUse:Date;
  lastAddr:string;
};
export interface IAppDeviceMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json(mine?:boolean):Partial<AppDevice>;
};
export interface IAppDevice extends AppDevice,IAppDeviceMethods {}
export type IAppDeviceStatics = {};