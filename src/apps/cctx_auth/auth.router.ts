import { Router } from 'express';
import { AuthController as ctrl } from './auth.controller';
import { AuthValidators as validators } from './auth.validators';
import { AuthJWT,loadV5,PostMiddleware,upload } from '@middleware';

const AuthRouter = () => {
  const router = Router();
  
  router.post("/signup",loadV5(...validators.Signup,ctrl.SignUp,...PostMiddleware));
  router.post("/send2fa",loadV5(ctrl.Send2FA,...PostMiddleware));
  router.post("/resend",loadV5(ctrl.ResendVerification,...PostMiddleware));
  router.post("/verify",loadV5(...validators.VerifyEmail,ctrl.Verify,...PostMiddleware));
  router.post("/register",loadV5(...validators.Register,ctrl.Register,...PostMiddleware));

  router.post("/login",loadV5(...validators.Login,ctrl.Login,...PostMiddleware));
  router.post("/login/refresh",loadV5(...validators.Login,ctrl.LoginRefreshToken,...PostMiddleware));
  
  router.put("/update",loadV5(AuthJWT(),...validators.Update,ctrl.Update,...PostMiddleware));
  router.post("/update/img",loadV5(AuthJWT(),upload.single('upload'),ctrl.UpdateImg,...PostMiddleware));
  router.post("/logout",loadV5(AuthJWT(),ctrl.Logout,...PostMiddleware));
  router.get("/auto",loadV5(AuthJWT(),ctrl.Autologin,...PostMiddleware));
  router.post("/profile",loadV5(AuthJWT(),ctrl.ActivateProfile,...PostMiddleware));

  return router;
};
export { AuthRouter };
export default AuthRouter;