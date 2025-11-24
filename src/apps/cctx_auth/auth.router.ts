import { Router } from 'express';
import { AuthController as ctrl } from './auth.controller';
import { AuthValidators as validators } from './auth.validators';
import { AuthJWT,PostMiddleware,upload } from '../../middlewares';
import Utils from '../../utils';

const AuthRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  router.post("/signup",[...validators.Signup,ctrl.SignUp,...PostMiddleware]);
  router.post("/send2fa",[ctrl.Send2FA,...PostMiddleware]);
  router.post("/resend",[ctrl.ResendVerification,...PostMiddleware]);
  router.post("/verify",[...validators.VerifyEmail,ctrl.Verify,...PostMiddleware]);
  router.post("/register",[...validators.Register,ctrl.Register,...PostMiddleware]);

  router.post("/login",[...validators.Login,ctrl.Login,...PostMiddleware]);
  router.post("/login/refresh",[...validators.Login,ctrl.LoginRefreshToken,...PostMiddleware]);
  
  router.put("/update",[AuthJWT(),...validators.Update,ctrl.Update,...PostMiddleware]);
  router.put("/update/:userId/img",[AuthJWT(),upload.single('file'),ctrl.UpdateImg,...PostMiddleware]);
  router.post("/logout",[AuthJWT(),ctrl.Logout,...PostMiddleware]);
  router.get("/auto",[AuthJWT(),ctrl.Auto,...PostMiddleware]);
  router.post("/profile",[AuthJWT(),ctrl.ActivateProfile,...PostMiddleware]);
  

  return router;
};
export { AuthRouter };
export default AuthRouter;