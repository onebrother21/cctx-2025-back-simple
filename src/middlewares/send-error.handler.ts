import Utils from "../utils";
import { doubleCsrfUtils } from "./set-csrf-token.handler";


const SendErrorHandler:() => IErrorHandler = () => async (err,req,res,next) => {
  const {csrfToken} = res.locals;
  if(res.headersSent) return next(err);
  else if(err instanceof Utils.AppError) res.status(err.status).json({
    status:err.status,
    success:false,
    message:err.message,
    errors:err.errors,
    csrfToken,
  });
  else if(err == doubleCsrfUtils.invalidCsrfTokenError){
    console.log(doubleCsrfUtils.invalidCsrfTokenError);
    res.status(403).json({
      status:403,
      success:false,
      message: "csrf validation error", 
      csrfToken,
    });
  }
  else if(err.name == "TokenExpiredError") res.status(401).json({
    status:401,
    success:false,
    message:"Your session is expired. Please login.",
    csrfToken,
  });
  else if(err.name == "JsonWebTokenError" && /malformed/i.test(err.message))  res.status(403).json({
    status:403,
    success:false,
    message:"This action is not allowed.",
    csrfToken,
  });
  else if(/validation/i.test(err.name) || /validation/i.test(err.message)) res.status(422).json({
    status:422,
    success:false,
    message:"Operation failed. Please check your data and try again.",
    error:{...err},
    csrfToken,
  });
  else if((err as any).status && (err as any).status < 500) res.status((err as any).status).json({
    status:(err as any).status,
    success:false,
    message:err.message,
    csrfToken,
  });
  else {
    const clockBugsQ = Utils.createQueue("clock-bugs");
    Utils.error(err);
    if(!await clockBugsQ.isPaused()) await clockBugsQ.add("clock-bug-job",{
      creator:req.profile?req.profile.id:null,
      creatorRef:req.user?req.user.role:"customer",
      category:"backend",
      type:"api-error",
      name:"unknown",
      description:err.message,
      info:{err},
      dueOn:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.status(500).json({
      status:500,
      success:false,
      message:err.message,
      csrfToken,
    });
  }
};
export default SendErrorHandler;