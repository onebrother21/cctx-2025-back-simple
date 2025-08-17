import Models from '../../../../models';
import Types from "../../../../types";
import Utils from '../../../../utils';
import bcrypt from "bcryptjs";

export class AdminBullUiController {
  static RenderLogin:IHandler = async (req,res,next) => res.render('login', {
    invalid: req.query.invalid === 'true',
    expired: req.query.expired === 'true'
  });
  static Login:IHandler = async (req,res,next) => {
    const {username,pin,role} = req.body;
    if(!(username && pin)) res.redirect("/jobs/login?invalid=true");
    else {
      const user = await Models.User.findOne({username});
      if (!user) {
        console.log("no user");
        req.session.user = null;
        res.redirect("/jobs/login?invalid=true");
      }
      else {
        const compare = await bcrypt.compare(pin,user.pin);
        if(!compare) {
          console.log("bad pin");
          req.session.user = null;
          res.redirect("/jobs/login?invalid=true");
        }
        else {
          await user.populate(`profiles.${role}`);
          req.session.user = {id:user.id,username,role};
          req.session.pageViews = (req.session.pageViews || 0) + 1;
          req.session.lastAction = req.method.toLocaleUpperCase() + " " + req.url;
          req.session.localSessionExp = Date.now() + 30 * 60000;
          res.redirect("/jobs");
        }
      }
    }
  };
  static CheckLogin:IHandler = async (req,res,next) => {
    if(!req.session.user) res.redirect("/jobs/login");
    else if(!req.session.localSessionExp) res.redirect("/jobs/login");
    else if(req.session.localSessionExp < Date.now()){
      req.session.localSessionExp = null;
      res.redirect("/jobs/login?expired=true");
    }
    else next();
  };
  static Logout:IHandler = async (req,res,next) => {
    req.session.user = null;
    req.session.localSessionExp = null;
    res.redirect('jobs/login');
  };
}
export default AdminBullUiController;