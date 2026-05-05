import Utils from "@utils";
import Types from "@types";

export const SetUserSession:() => IHandler = () => async (req,res,next) => {
  if(req.device) req.session.device = req.device.id;
  if(req.user){
    const {id,username} = req.user as Types.IUser;
    const accessTkn = res.locals.tokens.access;
    req.session.user = {id,username};
    req.session.pageViews = (req.session.pageViews || 0) + 1;
    req.session.lastAction = req.method.toLocaleUpperCase() + " " + req.url;
    if(accessTkn){
      req.session.auth = accessTkn.token;
      req.session.expires = new Date(accessTkn.expires).getTime();
    }
  }
  next();
};
export default SetUserSession;