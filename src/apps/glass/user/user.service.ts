import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';
import { QueryOptions } from 'mongoose';
import { IGlassUser } from "./user.types";

const {LocationHelpers} = Services;

const notify = Services.Notifications.createNotification;

const queryOpts:QueryOptions = { returnDocument:"after",runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class GlassUserService {
  static registerGlassUser = async (req:IRequest) => {
    type GlassUserInit = Partial<Types.IProfile> & LocationObj;
    const {loc,...data} = req.body.data as GlassUserInit;
    const user = req.user as Types.IUser;
    if(!data.app) throw new AppError(400,"unrecognized appspace!");
    if(!/glass/.test(data.app)) throw new AppError(400,"wrong app!");
    const role = data.app+"-"+data.type;
    const glassUser = new Profile({
      creator:req.user.id,
      status:profileStats.NEW,
      app:data.app,
      type:data.type,
      name:user.fullname,
      displayName:user.username,
      img:data.img,
      org:data.org,
      info:{...data.info},
      meta:{user:user.id},
      ...loc?{loc:{type:"Point",coordinates:loc}}:{},
    });
    await glassUser.saveMe();
    user.profiles.push({name:role,obj:glassUser});
    await user.saveMe();
    await notify({
      type:"USER_REGISTERED",
      method:EMAIL,
      audience:[{user:user.id as any,info:user.email}],
      data:{userName:glassUser.name}
    });
    user.role = role;
    await AppUsage.make(`usr/${user.id}`,"createdGlassUserProfile",{which:`prf/${glassUser.id}`});
    return {profile:glassUser};
  };
  static getGlassUserById = async (userId:string) => {
    const user = await Models.Profile.findById(userId);
    if(!user) throw new Utils.AppError(422,'Requested user not found');
    await user.populateMe();
    return {user};
  };
  static updateGlassUser = async (userId:string,{notes,...updates}:any) => {
    const user = await Models.Profile.findByIdAndUpdate(userId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!user) throw new Utils.AppError(422,'Requested user not found');
    await user.populateMe();
    return {user};
  };
  static deleteGlassUser = async (userId:string) => {
    const user = await Models.Profile.findByIdAndDelete(userId);
    if (!user) throw new Utils.AppError(422,'Requested user not found');
    return {ok:true};
  };
  static updateGlassUserStatus = async (
    userId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const user = await Models.Profile.findById(userId);
    if(!user) throw new Utils.AppError(422,'Requested user not found');
    await user.saveMe();
    return {user};
  };
}
export default GlassUserService;