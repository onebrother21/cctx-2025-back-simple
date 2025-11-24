import UpcentricTypes from "../../types";

import Types from "../../../../types";
import Models from '../../../../models';
import Utils from '../../../../utils';
import Services from '../../../../services';
import { MyQueueNames } from "../../../../workers";
import AppDevice from "models/app-device.model";


const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class AdminAcctsService {
  /** 📌 Admin Management */
  /** 📌 Creates admin profile
   * - refactor validator and controller for this method
   */
  static registerAdmin = async (req:IRequest) => {
    type AdminInit = Pick<Types.IProfile,"id"|"name"|"displayName"|"img"|"org"|"type"> & LocationObj;
    const {loc,...data} = req.body.data as AdminInit;
    const user = req.user as Types.IUser;
    const role = UpcentricTypes.IUpcentricProfiles.ADMIN;
    const admin = new Profile({
      type:data.type,
      name:user.fullname,
      displayName:user.username,
      img:data.img,
      org:data.org,
      meta:{user:user.id,scopes:[]},
      loc:{type:"Point",coordinates:loc},
      status:profileStats.NEW,
    });
    user.profiles[role] = admin.id;
    await admin.saveMe();
    await user.saveMe();
    await NotificationSvc.createNotification({
      type:"ADMIN_REGISTERED",
      method:EMAIL,
      audience:[user.id],
      data:{adminName:admin.name}
    });
    await AppUsage.make(user,"createdAdminProfile",{loc});
    user.role = role;
    return true;
  };
  static initializeSysAdmin = async (req:IRequest) => {
    const user = req.user as Types.IUser;
    const {loc,...data} = req.body.data;
    const bvars:any = req.bvars;
    const admin = await Profile.findOne({user:user.id});
    if(!admin) throw new AppError(404,"No admin found");
    Utils.info(bvars.master,data.master)
    if(!data.master || !bvars.master || data.master !== bvars.master) throw new AppError(400,"Invalid parameters");
    admin.info = {...admin.info,approvalHash:"#"+Utils.shortId().toLocaleLowerCase()};
    admin.meta.scopes.push("all","anything","everything");
    admin.approval = approvalStats.APPROVED;
    await admin.saveMe();
    await AppUsage.make("sys-admn",`sys-admn initiated`,{loc});
    return true;
  };
  static inviteAdmin = async (req:IRequest) => {
    const user = req.user as Types.IUser;
    const {loc,...data} = req.body.data;
    const bvars:any = req.bvars;
    const admin = await Profile.findOne({user:user.id});
    if(!admin) throw new AppError(404,"No admin found");
    if(!data.master || !bvars.master || data.master !== bvars.master) throw new AppError(400,"Invalid parameters");
    admin.info = {...admin.info,inviteHash:"#"+Utils.shortId().toLocaleLowerCase()};
    admin.meta.scopes.push("all","anything","everything");
    admin.approval = approvalStats.REQUESTED;
    await AppUsage.make(user,`invite sent, approval change to 'requested'`);
    return true;
  };
  /** 📌 Updates admin profile */
  static getAdminApprovals = async (req:IRequest) => {
    const admins = await Profile.find({approval:{$ne:approvalStats.APPROVED}});
    return admins;
  };
  
  static updateAdminApproval = async (req:IRequest) => {
    const user = req.user as Types.IUser;
    const adminId:string = req.params.adminId;
    const {approval,scopes} = req.body.data;
    const approvingAdmin = req.profile.id;
    if (!adminId) throw new AppError(404,"Admin param not provided!");
    const admin = await Profile.findById(adminId);
    if (!admin) throw new AppError(404,"No admin found");
    if(approval == approvalStats.APPROVED) admin.meta.scopes.push(...scopes);
    admin.info = {
      ...admin.info,
      approver:approvingAdmin.name,
      approvalHash:"#"+Utils.shortId().toLocaleLowerCase()
    };
    await AppUsage.make(user,`changed admin approval to '${approval}'`);
    return true;
  };
  /** 📌 Updates admin profile */
  static updateAdminProfile = async  (req:IRequest) => {
    const user = req.user as Types.IUser;
    const {location,items,...data} = req.body.data;
    if(location) data.location = {type:"Point",coordinates:location};
    const admin = await Profile.findByIdAndUpdate(req.params.adminId,data,queryOpts);
    if(!admin) throw new AppError(404,"Admin not found!");
    await AppUsage.make(user,`updated profile`);
    //await admin.populate("items.item");
    return admin;
  };
  /** 📌 Fetches and popluates admin profile */
  static getAdminProfile = async (req:IRequest) => await Profile.findById(req.params.adminId);
  /** 📌 Mark a admin profile for deletion */
  static deleteAdminProfile = async (req:IRequest) => {
    const user = req.user as Types.IUser;
    const admin = await Profile.findById(req.params.adminId);
    if (!admin) throw new AppError(404,"Admin not found!");
    admin.status = profileStats.DELETED;
    await AppUsage.make(user,"marked admin 'deleted'",{which:`a/${admin.id}`});
    await admin.saveMe();
    return true;
  };
  /** 📌 Mark a admin profile for deletion */
  static deleteXAdminProfile = async (req:IRequest) => {
    const user = req.user as Types.IUser;
    const admin = await Profile.findByIdAndDelete(req.params.adminId);
    if (!admin) throw new AppError(404, "Admin not found!");
    await AppUsage.make(user,"deleted admin profile",{which:`a/${admin.id}`});
    return true;
  };
}