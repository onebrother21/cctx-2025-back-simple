import Utils from '@utils';

const DecryptData:() => IHandler = () => (req,res,next) => {
  try {
    const useEncStr = req.headers["x-cctx-e2e"];
    const useEnc = Number(useEncStr);
    const isStaticSite = /vault|sys\/ui/.test(req.url);
    const isAppConfigRoute = /config/.test(req.url);
    const isUploadRoute = /uploads/.test(req.url);
    const isPostOrPut = ["post","put"].includes(req.method.toLowerCase());
    if(useEnc && !isAppConfigRoute){
      res.setHeader("x-cctx-e2e","1");
      res.locals.useEnc = true;
    }
    // Utils.trace({useEnc,isStaticSite,isUploadRoute,isPostOrPut});
    switch(true){
      case !useEnc:
      case isStaticSite:
      case isUploadRoute:
      case !isPostOrPut:{
        next();
        break;
      }
      default:{
        const data = req.body.data;
        const useEncryptedData = useEnc && data && typeof data === "string";
        switch(true){
          case !useEncryptedData:{
            next(new Utils.AppError(400,'No useEncrypted data provided'));
            break;
          }
          default:{
            req.body.data = Utils.decrypt(data);
            next();
            break;
          }
        }
      }
    }
  }
  catch (error) {next(error);}
};
const EncryptData:() => IHandler = () => (req, res,next) => {
  try {
    if(res.locals.useEnc && res.locals.data) res.locals.data = Utils.encrypt(res.locals.data);
    next();
  }
  catch (error) {next(error);}
};

export {
  DecryptData,
  EncryptData,
};