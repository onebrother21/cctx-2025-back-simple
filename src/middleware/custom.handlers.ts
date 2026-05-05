import Utils from "@utils";

const headerCheck:() => IHandler = () => async (req,res,next) => {
  console.log({headers:req.headers});
  next();
};
const cookieCheck:() => IHandler = () => async (req,res,next) => {
  console.log({cookies:req.cookies,signedCookies:req.signedCookies});
  next();
};
const sessionCheck:() => IHandler = () => async (req,res,next) => {
  console.log({session:{
    ...req.session,
    id:req.session.id,
    user:req.session.user,
  }});
  next();
};
const localsCheck:() => IHandler = () => async (req,res,next) => {
  console.log({locals:res.locals});
  next();
};
const PruneBody:() => IHandler = () => async (req,res,next) => {
  const isPostRoute = ["post","put"].includes(req.method.toLowerCase());
  if(!isPostRoute) return next();
  if(req.body.data){
    const {loc,device,...data} = req.body.data;
    req.body = {loc,device,data};
    console.log(req.body);
  }
  next();
};
export {
  headerCheck,
  sessionCheck,
  cookieCheck,
  localsCheck,
  PruneBody,
};