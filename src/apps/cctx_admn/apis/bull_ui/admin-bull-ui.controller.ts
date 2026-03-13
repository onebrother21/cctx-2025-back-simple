import Models from '@models';
import Services from "@services";
import Types from "@types";
import Utils from '@utils';

import bcrypt from "bcryptjs";
import AuthUtils from '../../../cctx_auth/apis/user/auth.utils';
import AdminUIService from './admin-bull-ui.service';

const {EMAIL,SMS} = Types.IContactMethods;
const {NEW,VERIFIED,ENABLED,ACTIVE,INACTIVE} = Types.IUserStatuses;

export class AdminUIController {
  static featureUrl = `/av3/cctx/admn/sys/ui`;
  static CheckLogin:IHandler = async (req,res,next) => {
    Utils.info({...req.session});
    switch(true){
      case !req.session.user:
      case !req.session.localSessionExp:{
        res.redirect(`${this.featureUrl}/login`);
        break;
      }
      case req.session.localSessionExp < Date.now():{
        req.session.localSessionExp = null;
        res.redirect(`${this.featureUrl}/login?expired=true`);
        break;
      }
      default:{
        next();
        break;
      }
    }
  };
  static RenderLogin:IHandler = async (req,res,next) => res.render('login', {
    invalid: req.query.invalid === 'true',
    expired: req.query.expired === 'true'
  });
  static Login:IHandler = async (req,res,next) => {
    type Login = Pick<Types.IUser,"pin"|"role"> & {emailOrUsername:string};
    const {data:{emailOrUsername,pin,role},loc} = req.body as {data:Login;} & LocationObj;
    switch(true){
      case !(emailOrUsername && pin):{
        res.redirect(`${this.featureUrl}/login?invalid=true`);
        break;
      }
      default:{
        const user = await Models.User.findOne({$or:[{email:emailOrUsername},{username:emailOrUsername}]});
        switch(true){
          case !user:{
            console.log("no user");
            req.session.user = null;
            res.redirect(`${this.featureUrl}/login?invalid=true`);
            break;
          }
          case !await bcrypt.compare(pin,user.pin):{
            console.log("bad pin");
            req.session.user = null;
            res.redirect(`${this.featureUrl}/login?invalid=true`);
            break;
          }
          default:{
            user.set({status:ACTIVE,"meta.lastLogin":new Date()});
            await user.saveMe();
            //await AuthUtils.recognizeUserLogin(user,req.device);
            //user.device = req.device;
            user.role = role;
            Utils.ok(user);
            //await AppUsage.make(`usr/${user.id}`,"loggedIn",{loc});

            req.session.user = {id:user.id,username:user.username,role};
            req.session.pageViews = (req.session.pageViews || 0) + 1;
            req.session.lastAction = req.method.toLocaleUpperCase() + " " + req.url;
            req.session.localSessionExp = Date.now() + 30 * 60000;
            res.redirect(`${this.featureUrl}/dash`);
            break;
          }
        }
      }
    }
  }
  static RenderDash:IHandler = async (req,res,next) => res.render('dash');
  static RenderPostJob:IHandler = async (req,res,next) => res.render('post-job', {
    invalid: req.query.invalid === 'true'
  });
  static CreateNotification:IHandler = async (req,res,next) => {
    const {id,username,role} = req.session.user;
    const notification = await Services.Notifications.createNotification({
      type:"TEST_EMAIL",
      method:EMAIL,
      audience:[{user:id,info:"service.onebrother@gmail.com"}],
      data:{name:username}
    });
    res.json({success:true,data:notification.json()})
  };
  static PostJob:IHandler = async (req,res,next) => {
    const result = await AdminUIService.launchSystemJob(req.body);
    res.json({success:true,result})
  };
  static Logout:IHandler = async (req,res,next) => {
    req.session.user = null;
    req.session.localSessionExp = null;
    res.redirect('/av3/cctx/admn/sys/ui/login');
  };
}
export default AdminUIController;