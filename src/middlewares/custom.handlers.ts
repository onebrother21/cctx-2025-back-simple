const headerCheck:() => IHandler = () => async (req,res,next) => {
  console.log({headers:req.headers});
  next();
};
const cookieCheck:() => IHandler = () => async (req,res,next) => {
  console.log({cookies:req.cookies,signedCookies:req.signedCookies});
  next();
};
const localsCheck:() => IHandler = () => async (req,res,next) => {
  console.log({locals:res.locals});
  next();
};
export {
  headerCheck,
  cookieCheck,
  localsCheck,
};