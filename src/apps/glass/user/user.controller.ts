
import GlassUserService from './user.service';

export class GlassUserController {
  static registerGlassUser:IHandler = async (req,res,next) => {
    try {
      const {profile} = await GlassUserService.registerGlassUser(req);
      res.locals = {
        ...res.locals,
        status:201,
        success:true,
        message:"You have registered a new user profile!",
        data:profile.json(true),
      };
      next();
    } catch (e) { next(e); }
  };
  static getGlassUserById:IHandler = async (req,res,next) => {
    try {
      const userId = req.params.userId as string;
      const {user} = await GlassUserService.getGlassUserById(userId);
      res.locals.success = true;
      res.locals.data = user.json();
      next();
    } catch (e) { next(e); }
  };
  static updateGlassUser:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const userId = req.params.userId as string;
      const {user} = await GlassUserService.updateGlassUser(userId,data);
      res.locals.success = true;
      res.locals.data = user.json();
      next();
    } catch (e) { next(e); }
  };
  static updateGlassUserStatus:IHandler = async (req,res,next) => {
    try {
      const userId = req.params.userId as string;
      const data = req.body.data;
      const {user} = await GlassUserService.updateGlassUserStatus(userId,data);
      res.locals.success = true;
      res.locals.data = user.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteGlassUser:IHandler = async (req,res,next) => {
    try {
      const userId = req.params.userId as string;
      const {ok} = await GlassUserService.deleteGlassUser(userId);
      res.locals.success = ok;
      res.locals.data = {removed:userId,ok};
      next();
    } catch (e) { next(e); }
  };
}
export default GlassUserController;