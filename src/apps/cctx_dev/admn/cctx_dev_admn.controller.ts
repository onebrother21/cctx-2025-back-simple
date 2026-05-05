import Models from "@models";
import Utils from "@utils";

export const appConfig:() => IHandler = () => async (req,res,next) => {
  const runtime = {
    apiDomain:req.bvars.domain,
    apiVersion:Utils.version(),
    secureMode:Utils.isEnv("prod"),
    ekey:process.env["ENCRYPTION_PUBLIC"],
  };
  const bvars = await Models.BusinessVars.findOne({name:"cctx_dev/admn",status:"active"});
  const data = bvars.json();
  const config = {...runtime,...data};

  res.locals.success = true;
  res.locals.data = config;
  next();
};
export const appClient:() => IHandler = () => async (req,res,next) => {
  //to flush device cookies, change cookie name (slug)
  Utils.log(req.session.meta);
  const meta = req.session.meta?Utils.parse(Utils.decrypt(req.session.meta)):{};
  const {make,model,mobile,id,ts} = meta.client||{};
  req.device = meta.client;
  const device = make?`${make} ${model} ${mobile?"mobile":""}`:"unknown";
  Utils.trace(`connection from ${device} device:${id}, first use:${new Date(ts).toDateString()}`);
  return next();
};