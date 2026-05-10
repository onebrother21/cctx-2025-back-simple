import { doubleCsrf, DoubleCsrfConfigOptions,DoubleCsrfConfig } from "csrf-csrf";
import Utils from "@utils";

const doubleCsrfOptions:DoubleCsrfConfigOptions = {
  getSecret: () => process.env.CSRF_SECRET || "supersecret",
  getSessionIdentifier:req => req.session["id"] || "", // A function that should return the session identifier for a given request
  cookieName:"x-csrf-token-pre", // The name of the cookie to be used, recommend using Host prefix. "__Host-psifi."
  cookieOptions: {
    sameSite:Utils.isProd()?"none":"lax",
    path: '/',
    secure:Utils.isProd(),
    httpOnly:true
  },
  // size: 64, // The size of the generated tokens in bits
  ignoredMethods: ["GET", "HEAD", "OPTIONS"] as any[], // A list of request methods that will not be protected.
  getCsrfTokenFromRequest:req => {
    const fromHeader = req.headers["x-csrf-token"];
    const fromCookie = req.cookies["XSRF-TOKEN"];
    //Utils.trace("check-csrf",{fromHeader,fromCookie});
    if(fromHeader) return fromHeader;
    return fromCookie;
  }, // A function that returns the token from the request
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