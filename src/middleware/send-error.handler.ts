import Utils from "@utils";
import { doubleCsrfUtils } from "./set-csrf-token.handler";

const SendErrorHandler:() => IErrorHandler = () => async (err,req,res,next) => {
  let response:any = {success:false,status:500,tokens:res.locals.tokens};
  if(res.headersSent) return next(err);
  switch(true){
    case err instanceof Utils.AppError:{
      Utils.log(`AppError`,err.message);
      response = {
        ...response,
        status:err.status,
        message:err.message,
        errors:err.errors,
      };
      break;
    }
    case err == doubleCsrfUtils.invalidCsrfTokenError:{
      Utils.log(`invalidCsrfTokenError`,err.message);
      response = {
        ...response,
        status:403,
        message:"csrf validation error",
      };
      break;
    }    
    case err.name == "TokenExpiredError":{
      Utils.log(`TokenExpiredError`,err.message);
      response = {
        ...response,
        status:401,
        message:"Your session is expired. Please login.",
      };
      break;
    }
    case err.name == "JsonWebTokenError" && /malformed/i.test(err.message):{
      Utils.log(`malformed`,err.message);
      response = {
        ...response,
        status:403,
        message:"This action is not allowed.",
      };
      break;
    }
    case /validation/i.test(err.name) || /validation/i.test(err.message):response = {
      ...response,
      status:422,
      message:"Operation failed. Please check your data and try again.",
      error:{...err},
    };break;
    case (err as any).status && (err as any).status < 500:response = {
      ...response,
      status:(err as any).status,
      message:err.message,
    };break;
    default:{
      const clockBugsQ = Utils.createQueue("clock-bugs");
      Utils.error(err);
      if(!await clockBugsQ.isPaused()) await clockBugsQ.add("clock-bug-job",{
        creator:req.profile?req.profile.id:null,
        creatorRef:req.user?req.user.role:"server",
        category:"backend",
        type:"api-error",
        name:"unknown",
        description:err.message,
        info:{err},
        dueOn:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      response = {
        ...response,
        status:500,
        message:err.message,
      };break;
    }
  }
  res.status(response.status).json(response);
};
export default SendErrorHandler;