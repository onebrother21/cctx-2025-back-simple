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
  static featureUrl = `/glass`;
  static RenderSignup:IHandler = async (req,res,next) => res.render('glass/index', {
    page:"signup",
    invalid: req.query.invalid === 'true',
    expired: req.query.expired === 'true',
    pageData:{user:null},
  });
  static RenderVerify:IHandler = async (req,res,next) => res.render('glass/index', {
    page:"verify",
    invalid: req.query.invalid === 'true',
    expired: req.query.expired === 'true',
    pageData:{user:null},
  });
  static RenderRegister:IHandler = async (req,res,next) => res.render('glass/index', {
    page:"register",
    invalid: req.query.invalid === 'true',
    expired: req.query.expired === 'true',
    pageData:{user:null},
  });
  static RenderLogin:IHandler = async (req,res,next) => res.render('glass/index', {
    page:"login",
    invalid: req.query.invalid === 'true',
    expired: req.query.expired === 'true',
    pageData:{user:null},
  });
  static RenderDash:IHandler = async (req,res,next) => res.render('glass/index',{
    page:"dash",
    pageData:{user:req.session.user}
  });
  static RenderSettings:IHandler = async (req,res,next) => res.render('glass/index',{
    page:"settings",
    pageData:{user:req.session.user}
  });
  static RenderAnalytics:IHandler = async (req,res,next) => res.render('glass/index',{
    page:"analytics",
    pageData:{user:req.session.user}
  });
  static RenderUsers:IHandler = async (req,res,next) => res.render('glass/index',{
    page:"users",
    pageData:{user:req.session.user}
  });
  static RenderAbout:IHandler = async (req,res,next) => res.render('glass/index',{
    page:"about",
    pageData:{user:req.session.user}
  });
  static RenderChats:IHandler = async (req,res,next) => res.render('glass/index',{
    page:"chats",
    pageData:{user:req.session.user}
  });
  static RenderChat:IHandler = async (req,res,next) => res.render('glass/index',{
    page:"chat",
    pageData:{user:req.session.user}
  });
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
  static CheckLogin:IHandler = async (req,res,next) => {
    //Utils.info({...req.session});
    switch(true){
      case !req.session.user:
      case !req.session.auth:
      case !req.session.expires:{
        res.redirect(`${this.featureUrl}/login`);
        break;
      }
      case req.session.expires < Date.now():{
        req.session.expires = null;
        res.redirect(`${this.featureUrl}/login?expired=true`);
        break;
      }
      default:{
        next();
        break;
      }
    }
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