import { AdminAcctsService } from './admin-accts.service';
import Utils from '../../../../utils';

export class AdminAcctsController {
  // Admin Management
  static registerAdmin:IHandler = async (req,res,next) => {
    try {
      const ok = await AdminAcctsService.registerAdmin(req);
      res.locals.status = 201;
      res.locals.success = true;
      res.locals.message = "You have registered a new admin profile!";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  static inviteAdmin:IHandler = async (req,res,next) => {
    try {
      const ok = await AdminAcctsService.inviteAdmin(req);
      res.locals.status = 201;
      res.locals.success = true;
      res.locals.message = "You have registered a new admin profile!";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  static updateAdmin:IHandler = async (req,res,next) => {
    try {
      const admin = await AdminAcctsService.updateAdminProfile(req);
      res.locals.success = true;
      res.locals.data = admin.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteAdmin:IHandler = async (req,res,next) => {
    try {
      const ok = await AdminAcctsService.deleteAdminProfile(req);
      Utils.log({ok})
      res.locals.success = true;
      res.locals.message =  "Admin account marked for deletion.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  static deleteXAdmin:IHandler = async (req,res,next) => {
    try {
      const ok = await AdminAcctsService.deleteXAdminProfile(req);
      res.locals.success = true;
      res.locals.message =  "Admin account deleted successfully.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  /**  Initialize sysadmin */
  static initializeSysAdmin:(cache:Utils.RedisCache) => IHandler = (cache) => async (req,res,next) => {
    try {
      const ok = await AdminAcctsService.initializeSysAdmin(req);
      res.locals.success = true;
      res.locals.message =  "Admin account updated successfully.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
  /**  Reviews and approves admin applications. */
  static getAdminApprovals:IHandler = async (req,res,next) => {
    try {
      const results = await AdminAcctsService.getAdminApprovals(req);
      res.locals.success = true;
      res.locals.data = {results};
      next();
    } catch (e) { next(e); }
  };
  static updateAdminApproval:IHandler = async (req,res,next) => {
    try {
      const ok = await AdminAcctsService.updateAdminApproval(req);
      res.locals.success = true;
      res.locals.message =  "Admin account updated successfully.";
      res.locals.data = {ok};
      next();
    } catch (e) { next(e); }
  };
}
export default AdminAcctsController;