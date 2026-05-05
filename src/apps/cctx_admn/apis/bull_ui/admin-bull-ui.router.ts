import { Router } from 'express';
import { loadV5 } from '@middleware';
import { MyQueueNames } from '@workers';
import Utils from '@utils';

import { AdminUIController as ctrl } from './admin-bull-ui.controller';

const AdminUIRouter = () => {
  const BullBoardRouter = Utils.getBullUIRouter(MyQueueNames,"/av3/cctx/admn/sys/ui");
  const router = Router();
  
  router.get('/login',loadV5(ctrl.RenderLogin));
  router.post('/login',loadV5(ctrl.Login));
  router.get('/logout',loadV5(ctrl.CheckLogin,ctrl.Logout));

  router.get('/dash',loadV5(ctrl.CheckLogin,ctrl.RenderDash));
  router.get('/jobs/new',loadV5(ctrl.CheckLogin,ctrl.RenderPostJob));
  router.post('/jobs',loadV5(ctrl.CheckLogin,ctrl.PostJob));
  router.get('/test',loadV5(ctrl.CheckLogin,ctrl.CreateNotification));
  router.get('/chat',loadV5(ctrl.CheckLogin,ctrl.RenderChat));

  router.get('/ui/*splat',loadV5(ctrl.CheckUrlForUiUi));
  router.use('/',loadV5(ctrl.CheckLogin,BullBoardRouter));

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