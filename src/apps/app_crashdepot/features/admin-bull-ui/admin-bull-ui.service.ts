import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Utils from '../../../../utils';

export class AdminBullUIService {
  static getQueueAdaptors = (queueNames:string[]) => {
    const adapters = [];
    for(const queue of queueNames) adapters.push(new BullMQAdapter(Utils.createQueue(queue)));
    return adapters;
  };
  static getBullBoardRouter = ({refreshInterval,basePath,queueNames,logout}:any) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(basePath);
    createBullBoard({
      queues:AdminBullUIService.getQueueAdaptors(queueNames),
      serverAdapter,
      options: {
        uiConfig: {
          pollingInterval:{showSetting:true,forceInterval:refreshInterval},
          miscLinks: [
            ...logout?[{text: 'Logout', url: '/jobs/logout'}]:[]
          ]
        },
      },
    });
    return serverAdapter.getRouter();
  }
}
export default AdminBullUIService;