import { doubleCsrf, DoubleCsrfConfigOptions,DoubleCsrfConfig } from "csrf-csrf";
import Utils from "@utils";

const csrfCookie = Utils.getVar("CSRF_COOKIE") || 'csrfCookie';
const csrfSecret = Utils.getVar("CSRF_SECRET") || 'csrfsecret';

const doubleCsrfOptions:DoubleCsrfConfigOptions = {
  getSessionIdentifier:req => req.session["id"] || Utils.longId(),
  getSecret: () => csrfSecret,
  cookieName:csrfCookie,
  cookieOptions: {
    sameSite:Utils.isProd()?"none":"lax",
    path: '/',
    secure:Utils.isProd(),
    httpOnly:true
  },
  // size: 64, // The size of the generated tokens in bits
  ignoredMethods: ["GET", "HEAD", "OPTIONS"] as any[],
  getCsrfTokenFromRequest:req => {
    const fromHeader = req.headers["x-csrf-token"];
    const fromCookie = req.cookies["XSRF-TOKEN"];
    Utils.trace("check-csrf",{fromHeader,fromCookie});
    if(fromHeader) return fromHeader;
    return fromCookie;
  },
};
const doubleCsrfUtils = doubleCsrf(doubleCsrfOptions);
const ValidateCsrfToken:() => IHandler = () => doubleCsrfUtils.doubleCsrfProtection;
const SetCsrfToken:() => IHandler = () => async (req, res, next) => {
  try{
    const csrfToken = doubleCsrfUtils.generateCsrfToken(req,res);
    res.locals.tokens = {csrf:csrfToken};
    res.cookie('XSRF-TOKEN',csrfToken,{
      sameSite:Utils.isProd()?"none":"lax",
      path: '/',
      secure:Utils.isProd(),
      httpOnly:true
    });
    next();
  }
  catch(e){next(e)}
};
export {SetCsrfToken,ValidateCsrfToken,doubleCsrfUtils};