import session,{ SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';
import Utils from "@utils";

const sessionCookie = Utils.getVar("SESSION_COOKIE") || 'sessionCookie';
const sessionSecret = Utils.getVar("SESSION_SECRET") || 'supersecret';

export const ConfigureSession:() => IHandler = () => {
  const dbLabel = `DB_URI_${(Utils.isProd() || Utils.isEnv("live"))?"LIVE":"LOCAL"}`;
  const dbUri = Utils.getVar(dbLabel) || '';
  const dbName = Utils.getVar("DB_NAME");
  if(!dbUri) throw {status:500,message:"No mongodb connection string provided"};

  const mongoStore = MongoStore.create({
    collectionName:"cctx_sessions",
    dbName,mongoUrl:dbUri,
    autoRemove: 'interval',
    autoRemoveInterval: 30 // In minutes
  });
  const sessionOpts:SessionOptions = {
    name:sessionCookie,
    secret:sessionSecret,
    saveUninitialized:true,
    resave:false,
    cookie:{
      sameSite:Utils.isProd()?"none":"lax",
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