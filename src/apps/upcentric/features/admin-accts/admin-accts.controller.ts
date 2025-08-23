import { AdminAcctsService } from './admin-accts.service';
import UpcentricTypes from "../../types";

import Types from "../../../../types";
import Models from '../../../../models';
import Utils from '../../../../utils';
import Services from '../../../../services';
import { MyQueueNames } from "../../../../workers";

export class AdminAcctsController {
  // Admin Management
  static registerAdmin:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const user = req.user as Types.IUser;
      const ok = await AdminAcctsService.registerAdmin(user,data);
      res.locals.status = 201;
      res.locals.success = true;
      res.locals.message = "You have registered a new admin profile!";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  static inviteAdmin:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const user = req.user as Types.IUser;
      const bvars = req.bvars;
      const ok = await AdminAcctsService.inviteAdmin(user,data,bvars);
      res.locals.status = 201;
      res.locals.success = true;
      res.locals.message = "You have registered a new admin profile!";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  static updateAdmin:IHandler = async (req,res,next) => {
    try {
      const admin_ = req.profile as UpcentricTypes.IUpcentricAdmin;
      const admin = await AdminAcctsService.updateAdminProfile(admin_.id,req.body.data);
      res.locals.success = true;
      res.locals.data = admin.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteAdmin:IHandler = async (req,res,next) => {
    try {
      const admin = req.profile as UpcentricTypes.IUpcentricAdmin;
      Utils.log({admin:admin.id})
      const ok = await AdminAcctsService.deleteAdminProfile(admin.id);
      Utils.log({ok})
      res.locals.success = true;
      res.locals.message =  "Admin account marked for deletion.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  static deleteXAdmin:IHandler = async (req,res,next) => {
    try {
      const admin = req.profile as UpcentricTypes.IUpcentricAdmin;
      const ok = await AdminAcctsService.deleteXAdminProfile(admin.id);
      res.locals.success = true;
      res.locals.message =  "Admin account deleted successfully.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  /**  Initialize sysadmin */
  static initializeSysAdmin:(cache:Utils.RedisCache) => IHandler = (cache) => async (req,res,next) => {
    try {
      const bvars = req.bvars;
      const data = req.body.data;
      const user = req.user as Types.IUser;
      const ok = await AdminAcctsService.initializeSysAdmin(user,data,bvars);
      res.locals.success = true;
      res.locals.message =  "Admin account updated successfully.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  /**  Reviews and approves admin applications. */
  static getAdminApprovals:IHandler = async (req,res,next) => {
    try {
      const approvingAdmin = req.profile as UpcentricTypes.IUpcentricAdmin;
      const adminId = req.params.adminId;
      const data= req.body.data;
      const results = await AdminAcctsService.getAdminApprovals();
      res.locals.success = true;
      res.locals.data = {results};
      next();
    } catch (e) { next(e); }
  };
  static updateAdminApproval:IHandler = async (req,res,next) => {
    try {
      const approvingAdmin = req.profile as UpcentricTypes.IUpcentricAdmin;
      const adminId = req.params.adminId;
      const data= req.body.data;
      const ok = await AdminAcctsService.updateAdminApproval(adminId,data,approvingAdmin);
      res.locals.success = true;
      res.locals.message =  "Admin account updated successfully.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
}
export default AdminAcctsController;