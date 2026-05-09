import session,{ SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';
import Utils from "@utils";

export const ConfigureSession:() => IHandler = () => {
  const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';
  const dbUrl = process.env[`DB_URI_${Utils.isEnv("live")?"LIVE":"LOCAL"}`];
  if(!dbUrl) throw {status:500,message:"No mongodb connection strin provided"};
  const mongoStore = MongoStore.create({
    collectionName:"ultimate-sessions",
    dbName:process.env.DB_NAME,
    mongoUrl:dbUrl,
    autoRemove: 'interval',
    autoRemoveInterval: 30 // In minutes
  });
  const sessionOpts:SessionOptions = {
    name:"my-ultimate-session",
    secret:cookieSecret,
    saveUninitialized:true,
    resave:false,
    cookie:{
      sameSite:"lax",
      path: '/',
      secure:Utils.isProd(),
      httpOnly:true,
      //maxAge:30 * 60 * 1000,
    },
    store:mongoStore,
  };
  return session(sessionOpts) as any;
};
export default ConfigureSession;