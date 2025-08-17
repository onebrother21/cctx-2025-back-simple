import Utils from "../utils";

const deviceCookie = process.env.DEVICE_COOKIE || 'deviceCookie';

export const SetUserDevice:() => IHandler = () => async (req, res, next) => {
  const cookie = req.signedCookies[deviceCookie];
  if(cookie){
    const device = Utils.decrypt(cookie);
    //check available app versions and refresh device
    req.device = device;
  }
  next();
};
export default SetUserDevice;