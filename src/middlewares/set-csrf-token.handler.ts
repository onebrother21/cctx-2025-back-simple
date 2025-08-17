import { doubleCsrf, DoubleCsrfConfigOptions,DoubleCsrfConfig } from "csrf-csrf";
import Utils from "../utils";

const doubleCsrfOptions:DoubleCsrfConfigOptions = {
  getSecret: () => process.env.CSRF_SECRET,
  //getSessionIdentifier: (req:IRequest) => req.session["id"] || "", // A function that should return the session identifier for a given request
  cookieName:"x-csrf-token-pre", // The name of the cookie to be used, recommend using Host prefix. "__Host-psifi."
  cookieOptions: {
    sameSite:"lax",
    path: '/',
    secure:process.env.NODE_ENV === 'production',
    httpOnly:true
  },
  // size: 64, // The size of the generated tokens in bits
  ignoredMethods: ["GET", "HEAD", "OPTIONS"] as any[], // A list of request methods that will not be protected.
  getTokenFromRequest: (req:IRequest) => {
    const fromHeader = req.headers["x-csrf-token"];
    const fromCookie = req.cookies["XSRF-TOKEN"];
    // Utils.trace({fromHeader,fromCookie});
    if(fromHeader) return fromHeader;
    return fromCookie;
  }, // A function that returns the token from the request
};
const doubleCsrfUtils = doubleCsrf(doubleCsrfOptions);

const SetCsrfToken:() => IHandler = () => async (req, res, next) => {
  try{
    const csrfToken = doubleCsrfUtils.generateToken(req,res,true);
    // Utils.trace({csrfToken});
    res.locals.csrfToken = csrfToken;
    res.cookie('XSRF-TOKEN',csrfToken,{
      sameSite:"lax",
      path: '/',
      secure:process.env.NODE_ENV === 'production',
      httpOnly:true
    });
    next();
  }
  catch(e){next(e)}
};
export {SetCsrfToken,doubleCsrfUtils};