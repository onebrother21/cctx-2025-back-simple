import * as DEVICE from "./app-device.types";

export type IAppUsageType = {
  who:"sys-admn"|`${"usr"|"prf"}/${string}`;//user
  what:string|number;//desc of action
  which?:`${"usr"|"prf"|"tsk"|"ntf"|"ssn"|"ven"|"case"|"att"}/${string}`;//object affected
  when:Date;//action date
  where?:[number,number];//geolocation
  how:string;//device info string -> os name & broswer name & make & model & ip
  to?:`${"usr"|"prf"|"prfg"}/${string}`;//g for group of profiles
  with?:string;//add'l info, params
  why?:string;//add'l info, reason
};
export type IAppUsageObj = DocEntityObj<IAppUsageType,"new">;
export type IAppUsage = DocEntity<IAppUsageObj>;

export interface IAppUsageStatics {
  make(
    user:"sys-admn"|`${"usr"|"prf"}/${string}`,
    action:string|number,
    data?:Partial<IAppUsage & LocationObj & {device:DEVICE.IAppDevice}>,
  ):Promise<IAppUsage>;
}
export type IAppUsageQueryKeys = {
  strings:|"who"|"what"|"which"|"how"|"to"|"with"|"why";
  dates:|"when_date";
  geoNear:"where";
};
export type IAppUsageQuery = StrongQuery<IAppUsageQueryKeys>;