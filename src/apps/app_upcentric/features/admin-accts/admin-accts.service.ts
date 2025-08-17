import UpcentricTypes from "../../types";

import Types from "../../../../types";
import Models from '../../../../models';
import Utils from '../../../../utils';
import Services from '../../../../services';
import { MyQueueNames } from "../../../../workers";


const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

export class AdminAcctsService {
  /** 📌 Admin Management */
  /** 📌 Creates admin profile
   * - refactor validator and controller for this method
   */
  static registerAdmin = async (user:Types.IUser,{loc,...data}:any) => {
    const role = UpcentricTypes.IUpcentricProfiles.ADMIN;
    const admin = new Models.Profile({
      type:"admin",
      name:user.fullname,
      img:data.img,
      meta:{user:user.id,scopes:[]},
      loc:{type:"Point",coordinates:loc},
    });
    await admin.save();
    user.profiles[role] = admin.id;
    await user.saveMe();
    //Send ADMIN_REGISTERED
    const notificationMethod = Types.IContactMethods.EMAIL;
    const notificationData =  {adminName:admin.name};
    await Services.Notifications.createNotification({
      type:"ADMIN_REGISTERED",
      method:notificationMethod,
      audience:[user.id],
      data:notificationData
    });
    user.role = role;
    return true;
  };
  static inviteAdmin = async (user:Types.IUser,{loc,...data}:any,bvars:any) => {
    const admin = await Models.Profile.findOne({user:user.id});
    if(!admin) throw new Utils.AppError(404,"No admin found");
    if(!data.master || !bvars.master || data.master !== bvars.master) throw new Utils.AppError(400,"Invalid parameters");
    const info = {hash:"#"+Utils.shortId().toLocaleLowerCase()};
    admin.meta.scopes.push("all","anything","everything");
    await admin.setApproval(Types.IApprovalStatuses.APRROVED,info);
    return true;
  };
  static initializeSysAdmin = async (user:Types.IUser,{loc,...data}:any,bvars:any) => {
    const admin = await Models.Profile.findOne({user:user.id});
    if(!admin) throw new Utils.AppError(404,"No admin found");
    Utils.info(bvars.master,data.master)
    if(!data.master || !bvars.master || data.master !== bvars.master) throw new Utils.AppError(400,"Invalid parameters");
    const info = {hash:"#"+Utils.shortId().toLocaleLowerCase()};
    admin.meta.scopes.push("all","anything","everything");
    await admin.setApproval(Types.IApprovalStatuses.APRROVED,info);
    return true;
  };
  /** 📌 Updates admin profile */
  static getAdminApprovals = async () => {
    const admins = await Models.Profile.find(
      {"approvalUpdates.name":{$ne:Types.IApprovalStatuses.APRROVED}},
      {approvalUpdates:{$slice:-1}}
    );
    return admins;
  };
  
  static updateAdminApproval = async (adminId:string,{approval,scopes}:any,approvingAdmin:UpcentricTypes.IUpcentricAdmin) => {
    if (!adminId) throw new Utils.AppError(404,"Admin not found!");
    //const options = {new:true,runValidators:true};
    const admin = await Models.Profile.findById(adminId);
    if (!admin) throw new Utils.AppError(404,"No admin found");
    if(approval == Types.IApprovalStatuses.APRROVED) admin.meta.scopes.push(...scopes);
    const info = {admin:approvingAdmin.name,hash:"#"+Utils.shortId().toLocaleLowerCase()};
    await admin.setApproval(approval,info);
    return true;
  };
  /** 📌 Updates admin profile */
  static updateAdminProfile = async (adminId:string,{location,items,...data}:any) => {
    if(location) data.location = {type:"Point",coordinates:location};
    const admin = await Models.Profile.findByIdAndUpdate(adminId,data,queryOpts);
    if(!admin) throw new Utils.AppError(404,"Admin not found!");
    //await admin.populate("items.item");
    return admin;
  };
  /** 📌 Fetches and popluates admin profile */
  static getAdminProfile = async (adminId: string) => await Models.Profile.findById(adminId);
  /** 📌 Mark a admin profile for deletion */
  static deleteAdminProfile = async (adminId:string) => {
    const admin = await Models.Profile.findById(adminId);
    if (!admin) throw new Utils.AppError(404,"Admin not found!");
    await admin.saveMe(Types.IProfileStatuses.DELETED,null);
    return true;
  };
  /** 📌 Mark a admin profile for deletion */
  static deleteXAdminProfile = async (adminId:string) => {
    const admin = await Models.Profile.findByIdAndDelete(adminId);
    if (!admin) throw new Utils.AppError(404, "Admin not found!");
    return true;
  };
}