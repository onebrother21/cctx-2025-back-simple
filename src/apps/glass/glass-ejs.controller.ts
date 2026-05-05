import Models from '@models';
import Services from "@services";
import Types from "@types";
import Utils from '@utils';

export class GlassEjsController {
  static featureUrl = `/glass`;
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
}