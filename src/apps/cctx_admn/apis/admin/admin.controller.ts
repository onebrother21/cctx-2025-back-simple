
import { AdminService } from './admin.service';
import DegenSessionQueries from '../../../jpmoney/degen_poker/apis/sessions/sessions-queries.service';
import DegenVenueQueries from '../../../jpmoney/degen_poker/apis/venues/venues-queries.service';
import DegenPlayerQueries from '../../../jpmoney/degen_poker/apis/players/players-queries.service';

//import PiMiaAttemptQueries from '../../../pi_mia/apis/attempts/attempts-queries.service';
import PiMiaCaseQueries from '../../../pi_mia/apis/cases/cases-queries.service';
import PiMiaInvoiceQueries from '../../../pi_mia/apis/invoices/invoices-queries.service';


import PingQueries from '../../../ping/apis/upser-ops/user-ops.service';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

export class AdminController {
  static queryAppUsage:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await AdminService.queryAppUsage(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryAppUsage:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await AdminService.queryAppUsage(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryAppUsage:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await AdminService.queryAppUsage(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}
export default AdminController;