import Utils from '@utils';

const DecryptData:() => IHandler = () => (req,res,next) => {
  try {
    const encStr = req.headers["x-cctx-e2e"];
    const enc = Number(encStr);
    const {body:{data}} = req;
    const encryptedData = enc && data && typeof data === "string";
    const isBullUIRoute = /sys\/ui/.test(req.url);
    const isUploadRoute = /uploads/.test(req.url);
    const isPostOrPut = ["post","put","patch"].includes(req.method.toLowerCase());

    switch(true){
      case !enc:
      case isBullUIRoute:
      case isUploadRoute:
      case !isPostOrPut:{
        next();
        break;
      }
      case !encryptedData:{
        next(new Utils.AppError(400,'No encrypted data provided'));
        break;
      }
      default:{
        req.body.data = Utils.decrypt(data);
        next();
        break;
      }
    }
  }
  catch (error) {next(error);}
};
const EncryptData:() => IHandler = () => (req, res,next) => {
  try {
    if(res.locals.enc && res.locals.data) res.locals.data = Utils.encrypt(res.locals.data);
    next();
  }
  catch (error) {next(error);}
};

export {
  DecryptData,
  EncryptData,
};