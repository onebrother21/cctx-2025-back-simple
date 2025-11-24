import { Router } from 'express';
import { AdminUIController as ctrl } from './admin-bull-ui.controller';
import { MyQueueNames } from '../../../workers';
import Utils from '../../../utils';

const AdminUIRouter = () => {
  const BullBoardRouter = Utils.getBullUIRouter(MyQueueNames);
  const router = Router();

  router.get('/login',ctrl.RenderLogin);
  router.post('/login',ctrl.Login);

  router.get('/test',ctrl.CheckLogin,ctrl.CreateNotification);
  router.get('/jobs/new',ctrl.CheckLogin,ctrl.RenderPostJob);
  router.post('/jobs',ctrl.CheckLogin,ctrl.PostJob);
  router.get('/dash',ctrl.RenderDash);
  router.get('/logout',ctrl.CheckLogin,ctrl.Logout);
  
  router.use('/',ctrl.CheckLogin,BullBoardRouter);  

  return router;
};
export { AdminUIRouter };
export default AdminUIRouter;

/*
router.get('/settings',ctrl.CheckLogin,ctrl.RenderPostJob);
router.post('/settings',ctrl.CheckLogin,ctrl.PostJob);


router.get('/profile',ctrl.CheckLogin,ctrl.RenderPostJob);
router.post('/profile',ctrl.CheckLogin,ctrl.PostJob);
*/