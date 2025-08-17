import Utils from "../utils";
import Types from "../types";

export const SetUserSession:() => IHandler = () => async (req,res,next) => {
  if(req.device) req.session.device = req.device.id;
  if(req.user){
    const {id,username} = req.user as Types.IUser;
    req.session.user = {id,username};
    req.session.pageViews = (req.session.pageViews || 0) + 1;
    req.session.lastAction = req.method.toLocaleUpperCase() + " " + req.url;
  }
  next();
};
export default SetUserSession;