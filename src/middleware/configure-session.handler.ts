import session,{ SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';
import Utils from "@utils";

export const ConfigureSession:() => IHandler = () => {
  const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';
  const dbLabel = `DB_URI_${(Utils.isProd() || Utils.isEnv("live"))?"LIVE":"LOCAL"}`;
  const dbUri = process.env[dbLabel] || '';
  const dbName = process.env.DB_NAME;
  if(!dbUri) throw {status:500,message:"No mongodb connection string provided"};

  const mongoStore = MongoStore.create({
    collectionName:"cctx-sessions",
    dbName,mongoUrl:dbUri,
    autoRemove: 'interval',
    autoRemoveInterval: 30 // In minutes
  });
  const sessionOpts:SessionOptions = {
    name:"cctx-session",
    secret:cookieSecret,
    saveUninitialized:true,
    resave:false,
    cookie:{
      //sameSite:Utils.isProd()?"none":"lax",
      secure:Utils.isProd(),
      path: '/',
      httpOnly:true,
      maxAge:30 * 60 * 1000,
    },
    store:mongoStore,
  };
  return session(sessionOpts) as any;
};
export default ConfigureSession;