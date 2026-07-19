import AdminService from './admin.service';

export class AdminController {
  static registerAdmin:IHandler = async (req,res,next) => {
    try {
      const ok = await AdminService.registerAdmin(req);
      res.locals = {
        ...res.locals,
        status:201,
        success:true,
        message:"You have registered a new admin profile!",
        data:{ok},
      };
      next();
    } catch (e) { next(e); }
  };
  static getAdminById:IHandler = async (req,res,next) => {
    try {
      const adminId = req.params.adminId as string;
      const {admin} = await AdminService.getAdminById(adminId);
      res.locals.success = true;
      res.locals.data = admin.json();
      next();
    } catch (e) { next(e); }
  };
  static updateAdmin:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const adminId = req.params.adminId as string;
      const {admin} = await AdminService.updateAdmin(adminId,data);
      res.locals.success = true;
      res.locals.data = admin.json();
      next();
    } catch (e) { next(e); }
  };
  static updateAdminStatus:IHandler = async (req,res,next) => {
    try {
      const adminId = req.params.adminId as string;
      const data = req.body.data;
      const {admin} = await AdminService.updateAdminStatus(adminId,data);
      res.locals.success = true;
      res.locals.data = admin.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteAdmin:IHandler = async (req,res,next) => {
    try {
      const adminId = req.params.adminId as string;
      const {ok} = await AdminService.deleteAdmin(adminId);
      res.locals.success = ok;
      res.locals.data = {removed:adminId,ok};
      next();
    } catch (e) { next(e); }
  };
}
export default AdminController;