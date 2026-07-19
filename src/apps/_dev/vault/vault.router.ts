import { Router } from 'express';
import { AuthJWT,PostMiddleware } from '@middleware';
import { appConfig } from './vault.controller';

const getVaultRouter = () => {
  const VaultRouter = Router();
  //VaultRouter.get("/config",loadV5(appConfig(),...PostMiddleware]);
  
  VaultRouter.get("/hm",(req,res) => res.render("vault/index"));
  VaultRouter.get("/login",(req,res) => res.render("vault/login"));
  VaultRouter.get("/settings",(req,res) => res.render("vault/settings/index"));
  VaultRouter.use("/markets",(req,res) => res.render("vault/markets"));
  VaultRouter.use("/wallet",(req,res) => res.render("vault/wallet"));
  return VaultRouter;
};
export { getVaultRouter };
export default getVaultRouter;