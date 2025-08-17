import { Router } from 'express';
import { AdminBullUiController as ctrl } from './admin-bull-ui.controller';
import AdminBullUIService from "./admin-bull-ui.service";
import Utils from '../../../../utils';
import { MyQueueNames } from '../../../../workers';

const AdminBullUiRouter = (cache:Utils.RedisCache) => {
  const BullBoardRouter = AdminBullUIService.getBullBoardRouter({
    queueNames:Object.values(MyQueueNames),
    basePath:"/av3/pi-mia/system-ui",
    refreshInterval:10 * 60 * 1000,
    logout:true,
    settings:true,
    postJobs:true,
    profile:true,
  });
  const router = Router();

  router.get('/login',ctrl.RenderLogin);
  router.post('/login',ctrl.Login);

  router.get('/test',ctrl.CheckLogin,ctrl.CreateNotification);
  router.get('/jobs/new',ctrl.CheckLogin,ctrl.RenderPostJob);
  router.post('/jobs',ctrl.CheckLogin,ctrl.PostJob);
  router.get('/dash',ctrl.RenderDash);

  
  router.get('/settings',ctrl.CheckLogin,ctrl.RenderPostJob);
  router.post('/settings',ctrl.CheckLogin,ctrl.PostJob);

  
  router.get('/profile',ctrl.CheckLogin,ctrl.RenderPostJob);
  router.post('/profile',ctrl.CheckLogin,ctrl.PostJob);

  router.get('/logout',ctrl.CheckLogin,ctrl.Logout);
  
  router.use('/',ctrl.CheckLogin,BullBoardRouter);  

  return router;
};
export { AdminBullUiRouter };
export default AdminBullUiRouter;