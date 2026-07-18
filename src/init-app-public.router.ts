import { Router } from 'express';
import Utils from '@utils';
import { loadV5, upload } from '@middleware';

class AppPublicController {
  static getHome:IHandler = async (req,res) => {res.json({success:true,message:"ready"});};
  static testDec:IHandler = async (req,res) => {
    try {
      const {encryptedData} = req.body;
      if(!encryptedData) {
        res.status(400).json({
          success:false,
          message:'No encrypted data provided'
        });
      }
      else {
        const supersecret = req.svars.key;
        const decryptedData = Utils.decrypt(encryptedData,supersecret);
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
  };
  static testEnc:IHandler = async (req,res) => {
    try {
      const data = { message: 'This is sensitive data' };
      const supersecret = req.svars.key;
      const encryptedData = Utils.encrypt(data,supersecret);
      res.json({success:true,data:encryptedData});
    }
    catch (error) {
      res.status(500).json({
        success:false,
        message:'Encryption failed',
        error,
      });
    }
  };
  static testConnect:IHandler = async (req,res) => {
    res.json({
      success:true,
      message:"ready",
      tokens:res.locals.tokens,
    });
  };
  static testUpload:IHandler = async (req,res) => {
    console.log(req.file);
    res.json({success:true,msg:"ok"});
  };
}
const getAppPublicRouter = () => {
  const router = Router();
  router.get("/hm",loadV5(AppPublicController.getHome));
  router.get('/decrypt',loadV5(AppPublicController.testDec));
  router.get('/encrypt',loadV5(AppPublicController.testEnc));
  router.get("/connect",loadV5(AppPublicController.testConnect));
  router.post("/upload",upload.single('file'),loadV5(AppPublicController.testUpload));
  return router;
};

export default getAppPublicRouter;