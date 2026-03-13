import { UAParser } from "ua-parser-js";
import Models from '@models';
import Utils from '@utils';

const deviceCookie = process.env.DEVICE_COOKIE || 'deviceCookie';
const queryOpts = {new:true,runValidators:true};

export const SetUserDevice:() => IHandler = () => async (req, res, next) => {
  if(["POST","PUT","PATCH"].includes(req.method)){
    const cookie = req.signedCookies[deviceCookie];
    const data = req.body.device;

    const ip = req.ip.replace(/:/gi,"").replace(/f/gi,"");
    const deviceParser:any = new UAParser(req.headers["user-agent"]);
    const deviceData:any = deviceParser.getResult() || {};
    const device_ = {...deviceData,...data};

    if(cookie){
      const deviceId = Utils.decrypt(cookie);
      const device = await Models.AppDevice.findByIdAndUpdate(deviceId,{
        $set:{
          ...device_,
          "meta.lastUse":new Date(),
          "meta.lastAddr":ip,
        },
        $addToSet:{addrs:ip },
      },queryOpts);
      req.device = device;
    }
    else {
      const device = await Models.AppDevice.create({
        ...device_,
        addrs:[ip],
        meta:{
          lastUse:new Date(),
          lastAddr:ip,
        },
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
  }
  next();
};
export default SetUserDevice;