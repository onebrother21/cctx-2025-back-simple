import { CrashReportsService } from './crash-reports.service';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class CrashReportsController {
  // CrashReport & Fulfillment
  static createCrashReport:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await CrashReportsService.createCrashReport(req.user.id,req.body.data);
      next();
    } catch (e) { next(e); }
  };
  static getCrashReportById:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await CrashReportsService.getCrashReportById(req.user.id);
      next();
    } catch (e) { next(e); }
  };
  static updateCrashReport:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await CrashReportsService.updateCrashReport(req.params.crashReportId,req.body.data);
      next();
    } catch (e) { next(e); }
  };
  static updateCrashReportStatus:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await CrashReportsService.updateCrashReportStatus(req.params.crashReportId,req.body.data.status);
      next();
    } catch (e) { next(e); }
  };
}