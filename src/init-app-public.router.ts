import { Router } from 'express';
import Utils from '@utils';

const getAppPublicRouter = () => {
  const router = Router();
  router.get("/hm",(req,res) => {res.json({success:true,message:"ready"});});
  router.get('/decrypt',(req,res) => {
    try {
      const {encryptedData} = req.body;
      if(!encryptedData) {
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
        error,
        message:'Decryption failed'
      });
    }
  });
  router.get('/encrypt',(req, res) => {
    try {
      const data = { message: 'This is sensitive data' };
      const encryptedData = Utils.encrypt(data);
      res.json({success:true,data:encryptedData});
    }
    catch (error) {
      res.status(500).json({
        success:false,
        message:'Encryption failed',
        error,
      });
    }
  });
  router.get("/connect",(req,res) => {
    res.json({
      success:true,
      message:"ready",
      tokens:res.locals.tokens,
    });
  });
  return router;
};

export default getAppPublicRouter;

/*
  router.post("/upload-test",upload.single('file'),[(req:any,res:any) => {
    console.log(req.file);
    res.json({success:true,msg:"ok"});
  }]);
*/