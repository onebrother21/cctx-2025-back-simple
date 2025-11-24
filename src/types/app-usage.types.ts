import mongoose,{Schema,Model} from 'mongoose';
import * as USER from "./user.types";

export type LocationObjStr = `${number}${"X"|"|"}${number}`;
export type AppUsageUpdate = {
  who:"sys-admn"|`${"u"|"a"}/${string}`;//user
  what:string|number;//desc of action
  which?:`${"u"|"a"|"t"|"n"}/${string}`;//object affected
  when:Date;//action date
  where?:LocationObjStr;//geolocation
  how:ObjectId_|string;//device id
  to?:`${"u"|"a"|"g"}/${string}`;//g for group of profiles
  with?:string;//add'l info, params
  why?:string;//add'l info, reason
}
export interface IAppUsageMethods {
  saveMe():Promise<void>;
  json():Partial<AppUsageUpdate>;
};
export interface IAppUsage extends AppUsageUpdate,IAppUsageMethods {}
export type IAppUsageStatics = {
  make(
    user:USER.IUser|"sys-admn",
    action:string|number,
    data?:Partial<IAppUsage & LocationObj>,
  ):Promise<IAppUsage>;
};