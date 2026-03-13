import Utils from "@utils";

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
const PruneBody:() => IHandler = () => async (req,res,next) => {
  if(!["post","put"].includes(req.method.toLowerCase())) return next();
  const {loc,device,...data} = req.body.data;
  req.body = {loc,device,data};
  next();
};
export {
  headerCheck,
  cookieCheck,
  localsCheck,
  PruneBody,
};