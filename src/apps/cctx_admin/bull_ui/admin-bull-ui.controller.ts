import Models from '../../../models';
import Services from "../../../services";
import Types from "../../../types";
import Utils from '../../../utils';

import bcrypt from "bcryptjs";
import AdminUIService from './admin-bull-ui.service';

const {EMAIL} = Types.IContactMethods;

export class AdminUIController {
  static RenderLogin:IHandler = async (req,res,next) => res.render('login', {
    invalid: req.query.invalid === 'true',
    expired: req.query.expired === 'true'
  });
  static Login:IHandler = async (req,res,next) => {
    const {username,pin,role} = req.body;
    if(!(username && pin)) res.redirect("/av3/cctx/sys/ui/login?invalid=true");
    else {
      const user = await Models.User.findOne({username});
      if (!user) {
        console.log("no user");
        req.session.user = null;
        res.redirect("/av3/cctx/sys/ui/login?invalid=true");
      }
      else {
        const compare = await bcrypt.compare(pin,user.pin);
        if(!compare) {
          console.log("bad pin");
          req.session.user = null;
          res.redirect("/av3/cctx/sys/ui/login?invalid=true");
        }
        else {
          //await user.populate(`profiles.${role}`);
          req.session.user = {id:user.id,username,role};
          req.session.pageViews = (req.session.pageViews || 0) + 1;
          req.session.lastAction = req.method.toLocaleUpperCase() + " " + req.url;
          req.session.localSessionExp = Date.now() + 30 * 60000;
          res.redirect("/av3/cctx/sys/ui/dash");
        }
      }
    }
  };
  static CheckLogin:IHandler = async (req,res,next) => {
    Utils.info(req.session);
    if(!req.session.user) res.redirect("/av3/cctx/sys/ui/login");
    else if(!req.session.localSessionExp) res.redirect("/av3/cctx/sys/ui/login");
    else if(req.session.localSessionExp < Date.now()){
      req.session.localSessionExp = null;
      res.redirect("/av3/cctx/sys/ui/login?expired=true");
    }
    else next();
  };
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
    res.redirect('/av3/cctx/sys/ui/login');
  };
}
export default AdminUIController;