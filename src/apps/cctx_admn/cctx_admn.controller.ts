import Models from "@models";
import Utils from "@utils";

export class CCTX_AdmnController {
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
  static AppClient:() => IHandler = () => async (req,res,next) => {
    /*
    //to flush device cookies, change cookie name (slug)
    Utils.log(req.session.meta);
    const meta = req.session.meta?Utils.parse(Utils.decrypt(req.session.meta,supersecret)):{};
    const {make,model,mobile,id,ts} = meta.client||{};
    req.device = meta.client;
    const device = make?`${make} ${model} ${mobile?"mobile":""}`:"unknown";
    Utils.trace(`connection from ${device} device:${id}, first use:${new Date(ts).toDateString()}`);
    */
    return next();
  };
}
export default CCTX_AdmnController;