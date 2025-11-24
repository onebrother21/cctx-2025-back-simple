import { Router } from 'express';
import { ApiConnect,PostMiddleware } from '../middlewares';
import Utils from '../utils';

const getAppPublicRouter = (cache:Utils.RedisCache) => {
  const router = Router();

  router.get("/hm",(req:IRequest,res) => {res.json({success:true,message:"ready"});});
  router.get('/decrypt',(req:IRequest, res) => {
    try {
      const {encryptedData} = req.body;
      if (!encryptedData) {
        res.status(400).json({
          success:false,
          message:'No encrypted data provided'
        });
      }
      else {
        const decryptedData = Utils.decrypt(encryptedData);
        res.json({success:true,...decryptedData});
      }
    }
    catch (error) {
      res.status(500).json({
        success:false,
        error:'Decryption failed',
        details:error.message
      });
    }
  });
  router.get('/encrypt',(req:IRequest, res) => {
    try {
      const data = { message: 'This is sensitive data' };
      const encryptedData = Utils.encrypt(data);
      res.json({success:true,data:encryptedData});
    }
    catch (error) {
      res.status(500).json({
        success:false,
        message:'Encryption failed',
        error: error.message
      });
    }
  });
  router.get("/connect",(req:IRequest,res) => {res.json({success:true,message:"ready",csrfToken:res.locals.csrfToken});});
  router.post("/connect",[ApiConnect(),...PostMiddleware]);
  return router;
};

export default getAppPublicRouter;

/*
  router.post("/upload-test",upload.single('file'),[(req:any,res:any) => {
    console.log(req.file);
    res.json({success:true,msg:"ok"});
  }]);
*/