import session,{ SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';
import Utils from "@utils";


// COOKIES & SESSIONS
const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';

export const ConfigureSession:() => IHandler = () => {
  const mongoStore = MongoStore.create({
    collectionName:"ultimate-sessions",
    dbName:process.env.DB_NAME,
    mongoUrl:process.env[`DB_URI_${/live/i.test(Utils.env())?"LIVE":"LOCAL"}`],
    autoRemove: 'interval',
    autoRemoveInterval: 30 // In minutes
  });
  const sessionOpts:SessionOptions = {
    name:"my-ultimate-session",
    secret:cookieSecret,
    saveUninitialized:true,
    resave:false,
    cookie:{
      sameSite:"strict",
      path: '/',
      secure:process.env.NODE_ENV === 'production',
      httpOnly:true,
      maxAge:30 * 60 * 1000,
    },
    store:mongoStore,
  };
  return session(sessionOpts) as any;
};
export default ConfigureSession;