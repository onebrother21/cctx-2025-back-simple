import Utils from '../utils';

const DecryptData:() => IHandler = () => (req,res,next) => {
  try {
    const isBullUIRoute = /system-ui/.test(req.url);
    const isUploadRoute = /uploads/.test(req.url);
    const isPostOrPut = ["post","put","patch"].includes(req.method.toLowerCase());

    const {query} = req.query;
    const {data,enc} = req.body;
    const isEnc = enc && data && typeof data === "string";
    const isBypass = isBullUIRoute || isUploadRoute || !isPostOrPut || !enc;
    const encryptedData = isPostOrPut && isEnc;

    switch(true){
      case isBypass:{
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