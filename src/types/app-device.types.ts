export enum IAppDeviceStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
}
export type IAppDeviceType = {
  ua:string;
  mobile:boolean;
  browser:Record<"name"|"version"|"major"|"type",string>;
  screen:Record<"height"|"width",number>;
  device:Record<"type"|"model"|"vendor",string>;
  engine:Record<"name"|"version",string>;
  os:Record<"name"|"version",string>;
  socket:string;
  addrs:string[];
  meta:{
    lastUse:Date;
    lastAddr:string;
  };
};
export type IAppDeviceObj = DocEntityObj<IAppDeviceType,IAppDeviceStatuses>;
export type IAppDevice = DocEntity<IAppDeviceObj>;

export type IAppDeviceQueryKeys = {
  strings:
  |"ua"|"socket"|"addrs"
  |`browser.${keyof IAppDevice["browser"]}`
  |`device.${keyof IAppDevice["device"]}`
  |`engine.${keyof IAppDevice["engine"]}`
  |`os.${keyof IAppDevice["os"]}`
  |"meta.lastAddr";
  booleans:"mobile";
  numbers:`screen.${keyof IAppDevice["screen"]}`;
  dates:|"created_on"|"meta.lastUse";
  //geoNear:"location";
};
export type IAppDeviceQuery = StrongQuery<IAppDeviceQueryKeys>;