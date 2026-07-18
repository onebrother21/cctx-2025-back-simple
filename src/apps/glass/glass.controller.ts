import Models from '@models';
import Services from "@services";
import Types from "@types";
import Utils from '@utils';

import GlassNumbersService from "./glass.service";

const {EMAIL,SMS} = Types.IContactMethods;

export class GlassController {
  static AppConfig:IHandler = async (req,res,next) => {
    res.locals.success = true;
    res.locals.data = req.cvars;
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
  static runGapFillStrategy:IHandler = async (req,res,next) => {
    const {id,username,role} = req.session.user;
    const {results} = await GlassNumbersService.runGapFillStrategy(req.body.data);
    res.locals.success = true;
    res.locals.data = results;
    next();
  };
  static runPSStrategy:IHandler = async (req,res,next) => {
    const {id,username,role} = req.session.user;
    const {results} = await GlassNumbersService.runPositionShiftStrategy(req.body.data);
    res.locals.success = true;
    res.locals.data = results;
    next();
  };
  static runMovingWeightsStrategy:IHandler = async (req,res,next) => {
    const {id,username,role} = req.session.user;
    const {results} = await GlassNumbersService.runMovingWeightsStrategy(req.body.data);
    res.locals.success = true;
    res.locals.data = results;
    next();
  };
  static runStrategySim:IHandler = async (req,res,next) => {
    const {id,username,role} = req.session.user;
    const data = await GlassNumbersService.runStrategySim(req.body.data);
    res.locals.success = true;
    res.locals.data = data;
    next();
  };
  static calcComboProbability:IHandler = async (req,res,next) => {
    const {id,username,role} = req.session.user;
    const data = await GlassNumbersService.calcComboProbability(req.body.data);
    res.locals.success = true;
    res.locals.data = data;
    next();
  };
}