import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';
import { QueryOptions } from 'mongoose';

import PiMiaModels from "../../models";
import PiMiaTypes from "../../types";

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

export class AdminService {
  static registerAdmin = async (req:IRequest) => {
    type AdminInit = Partial<Types.IProfile> & LocationObj;
    const {loc,...data} = req.body.data as AdminInit;
    const user = req.user as Types.IUser;
    const app = data.app;
    if(!app) throw new AppError(400,"unrecognized appspace!");
    if(!/degen_poker/.test(app)) throw new AppError(400,"wrong app!");
    const role = app+"-"+data.type;

    const admin = new Profile({
      creator:req.user.id,
      app,
      type:data.type,
      name:user.fullname,
      displayName:user.username,
      img:data.img,
      org:data.org,
      meta:{user:user.id,scopes:[]},
      loc:{type:"Point",coordinates:loc},
      status:profileStats.NEW,
      info:{...data.info}
    });
    try{await admin.saveMe();}catch(e){Utils.error(e);throw e;}
    user.profiles.push({name:role,obj:admin});
    await user.saveMe();
    await notify({
      type:"PLAYER_REGISTERED",
      method:EMAIL,
      audience:[{user:user.id as any,info:user.email}],
      data:{adminName:admin.name}
    });
    user.role = role;
    await AppUsage.make(`usr/${user.id}`,"createdAdminProfile",{which:`prf/${admin.id}`});
    return true;
  };
  static getAdminById = async (adminId:string) => {
    const admin = await Models.Profile.findById(adminId);
    if(!admin) throw new Utils.AppError(422,'Requested admin not found');
    await admin.populateMe();
    return {admin};
  };
  static updateAdmin = async (adminId:string,{notes,...updates}:any) => {
    const admin = await Models.Profile.findByIdAndUpdate(adminId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!admin) throw new Utils.AppError(422,'Requested admin not found');
    await admin.populateMe();
    return {admin};
  };
  static deleteAdmin = async (adminId:string) => {
    const admin = await Models.Profile.findByIdAndDelete(adminId);
    if (!admin) throw new Utils.AppError(422,'Requested admin not found');
    return {ok:true};
  };
  static updateAdminStatus = async (
    adminId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const admin = await Models.Profile.findById(adminId);
    if(!admin) throw new Utils.AppError(422,'Requested admin not found');
    await admin.saveMe();
    return {admin};
  };
}
export default AdminService;