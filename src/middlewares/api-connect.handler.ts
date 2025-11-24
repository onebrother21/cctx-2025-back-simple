import { UAParser } from "ua-parser-js";
import Models from '../models';
import Utils from '../utils';

const deviceCookie = process.env.DEVICE_COOKIE || 'deviceCookie';

const apiConnect:() => IHandler = () => async (req,res,next) => {
  try {
    const data = req.body.data;
    if(!req.device){
      const ip = req.ip.replace(/:/gi,"").replace(/f/gi,"");
      const deviceParser:any = new UAParser(req.headers["user-agent"]);
      const deviceData:any = deviceParser.getResult() || {};
      const device = await Models.AppDevice.create({
        ...deviceData,
        ...data,
        addrs:[ip],
        lastUse:new Date(),
        lastAddr:ip
      });
      res.cookie(deviceCookie,Utils.encrypt(device.id),{ 
        sameSite:"lax",
        path: '/',
        secure:process.env.NODE_ENV === 'production',
        httpOnly:true,
        signed:true,
      });
      req.device = device;
    }
    res.locals.success = true;
    res.locals.enc = true;
    res.locals.data = {connected:true};
    next();
  }
  catch(e){next(e);}
};
export default apiConnect;