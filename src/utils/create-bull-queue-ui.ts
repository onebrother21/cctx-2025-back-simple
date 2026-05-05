import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import createQueue from './create-bull-queue';

export class BullQueueUi {
  static createQueueAdaptors = (queueNames:string[]) => {
    const adapters = [];
    for(const queue of queueNames) adapters.push(new BullMQAdapter(createQueue(queue)));
    return adapters;
  };
  static createRouter = ({refreshInterval,basePath,queueNames,profile,logout,postJobs,settings}:any) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(basePath);
    createBullBoard({
      queues:this.createQueueAdaptors(queueNames),
      serverAdapter,
      options: {
        uiConfig: {
          pollingInterval:{showSetting:true,forceInterval:refreshInterval},
          miscLinks: [
            {text: 'My Dash', url: '/av3/cctx/admn/sys/ui/dash'},
            ...postJobs?[{text: 'Post Job', url: '/av3/cctx/admn/sys/ui/jobs/new'}]:[],
            ...logout?[{text: 'Logout', url: '/av3/cctx/admn/sys/ui/logout'}]:[]
            /*
            ...profile?[{text: 'My Profile', url: '/av3/pi-mia/system-ui/profile'}]:[],
            ...settings?[{text: 'Settings', url: '/av3/pi-mia/system-ui/settings'}]:[],
            */
          ]
        },
      },
    });
    return serverAdapter.getRouter();
  }
}
export const getBullUIRouter = (MyQueueNames:any,basePath:string) => {
  return BullQueueUi.createRouter({
    queueNames:Object.values(MyQueueNames),
    basePath,
    refreshInterval:10 * 60 * 1000,
    logout:true,
    settings:true,
    postJobs:true,
    profile:true,
  });
};