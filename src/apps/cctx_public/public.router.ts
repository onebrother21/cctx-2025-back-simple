import { Router } from 'express';
import {
  PostMiddleware,
} from "../../middlewares";
import {ApiConnectionController as ctrl} from "../upcentric/api-connect.controller";
import Utils from '../../utils';

const getAppPublicRouter = (cache:Utils.RedisCache) => {
  const router = Router();

  router.get("/hm",(req,res) => {res.json({success:true,message:"ready"});});
  router.get("/connect",(req,res) => {res.json({success:true,message:"ready",csrfToken:res.locals.csrfToken});});
  router.get('/decrypt',(req, res) => {
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
        error: error.message
      });
    }
  });
  return router;
};

const getApiConnectionRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  router.get("/config",[ctrl.appConfig,...PostMiddleware]);
  router.post("/connect",[ctrl.appConnect,...PostMiddleware]);
  return router;
};
export {getAppPublicRouter,getApiConnectionRouter};