import Models from '@models';
import Services from "@services";
import Types from "@types";
import Utils from '@utils';

import bcrypt from "bcryptjs";
import AuthUtils from '../cctx_auth/auth.utils';

const USE_2FA = process.env.USE_2FA;
const USE_VERIFY_AGE = process.env.USE_VERIFY_AGE;

const {EMAIL,SMS} = Types.IContactMethods;
const {NEW,ACTIVE,INACTIVE} = Types.IUserStatuses;

export class GlassController {
  static AppConfig:IHandler = async (req,res,next) => {
    const runtime = {
      apiDomain:req.bvars.domain,
      apiVersion:Utils.version(),
      secureMode:Utils.isEnv("prod"),
      ekey:process.env["ENCRYPTION_PUBLIC"],
      env:Utils.env(),
    };
    const bvars = await Models.BusinessVars.findOne({name:"glass",status:"active"});
    const data = bvars.json();
    const config = {...runtime,...data};
  
    res.locals.success = true;
    res.locals.data = config;
    next();
  };
  static AppConnect:IHandler = async (req,res,next) => {
    res.locals.success = true;
    res.locals.message = "ready";
    next();
  };
  static CreateNotification:IHandler = async (req,res,next) => {
    const {id,username,role} = req.session.user;
    const info = req.body.data;
    const notification = await Services.Notifications.createNotification({
      type:"TEST_EMAIL",
      method:EMAIL,
      audience:[{user:id,info:"service.onebrother@gmail.com"}],
      data:{name:username,info}
    });
    res.json({success:true,pageData:notification?.json() || {}})
  };
}