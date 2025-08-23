import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Utils from '../../../../utils';
import { MyQueueNames } from "../../../../workers";

export class AdminBullUIService {
  static getQueueAdaptors = (queueNames:string[]) => {
    const adapters = [];
    for(const queue of queueNames) adapters.push(new BullMQAdapter(Utils.createQueue(queue)));
    return adapters;
  };
  static getBullBoardRouter = ({refreshInterval,basePath,queueNames,profile,logout,postJobs,settings}:any) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(basePath);
    createBullBoard({
      queues:AdminBullUIService.getQueueAdaptors(queueNames),
      serverAdapter,
      options: {
        uiConfig: {
          pollingInterval:{showSetting:true,forceInterval:refreshInterval},
          miscLinks: [
            {text: 'My Dash', url: '/av3/pi-mia/system-ui/dash'},
            /*
            ...profile?[{text: 'My Profile', url: '/av3/pi-mia/system-ui/profile'}]:[],
            ...settings?[{text: 'Settings', url: '/av3/pi-mia/system-ui/settings'}]:[],
            ...postJobs?[{text: 'Post Job', url: '/av3/pi-mia/system-ui/jobs/new'}]:[],
            ...logout?[{text: 'Logout', url: '/av3/pi-mia/system-ui/logout'}]:[]
            */
          ]
        },
      },
    });
    return serverAdapter.getRouter();
  }
  static launchSystemJob = async (n:any) => {
    Utils.info(n);
    const {type,delay,every,data} = n;
    const myQueues = Object.values(MyQueueNames).reduce((o,k) => ({...o,[k]:Utils.createQueue(k)}),{});
    const opts:any = {};
    let result:any;
    switch(type){
      case "random-sleep":{
        if(!delay) throw new Utils.AppError(422,"operation failed");
        opts.delay = delay * 1000; // Convert seconds to milliseconds
        const job = await myQueues["random-sleep"].add('random-sleep-job',{ title:data.title }, opts);
        result = {message:`Random sleep processor added, Job: ${job.id}`};
        break;
      }
      case "send-notifications":{
        if(!every) throw new Utils.AppError(422,"operation failed");
        opts.repeat = {every:every * 60 * 1000}; // Convert minutes to milliseconds
        const job = await myQueues["send-notifications"].add('send-notifications-job',{},opts);
        result =  {message:`Notification processor on repeat every ${every} ms, Job: ${job.id}`};
        break;
      }
      /*
      case "autoAssignCouriers":{
        if(!every) throw new Utils.AppError(422,"operation failed");
        opts.repeat = {every:every * 60 * 1000}; // Convert minutes to milliseconds
        const job = await myQueues["auto-assign-couriers"].add('auto-assign-couriers-job',{},opts);
        result =  {success: true,message:`Auto assigning couriers on repeat every ${every} ms, Job: ${job.id}`};
        break;
      }
      case "bulkEditCollection":{
        if(!(data.modelName && data.newProps)) throw new Utils.AppError(422,"operation failed");
        const job = await myQueues["bulk-edit-collection"].add('bulk-edit-collection-job',data,opts);
        result =  {success: true,message:`Bulk Edit: ${data.modelName.toLocaleUpperCase()} -> Submitted, Job: ${job.id}`};
        break;
      }
      case "logData":{
        if(!data) throw new Utils.AppError(422,"operation failed");
        const job = await myQueues["log-data"].add('log-data-job',data,opts);
        const jobId = job.id || "Unknown";
        result =  {success: true,message:`Log Data -> SUBMITTED, Job: ${jobId}`};
        break;
      }
      case "tokenCleanup":{
        if(!data) throw new Utils.AppError(422,"operation failed");
        opts.repeat = {every:every * 60 * 1000}; // Convert minutes to milliseconds
        const job = await myQueues["token-cleanup"].add('token-cleanup-job',data,opts);
        const jobId = job.id || "Unknown";
        result =  {success: true,message:`Token CleanUp -> SUBMITTED, Job: ${jobId}`};
        break;
      }
      */
      default:throw new Utils.AppError(400,"no worker found");
    }
    return result;
  }
}
export default AdminBullUIService;