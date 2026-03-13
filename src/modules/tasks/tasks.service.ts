import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage,Task} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class CCTXTasksService {
  // 📌 Task CRUD Ops
  static createCCTXTasks = async (creator:string,newCCTXTasks:Partial<Types.ITask>[]) => {
    const tasks:Types.ITask[] = [];
    for(let i = 0,l = newCCTXTasks.length;i<l;i++){
      const nt = {
        creator,
        info:{},
        meta:{},
        notes:[],
        tasks:[],
        ...newCCTXTasks[i]
      };
      const task = new Task(nt);
      await task.saveMe();
      tasks.push(task);
    }
    await AppUsage.make(`prf/${creator}`,"createdTasks");
    return {tasks};
  };
  static createCCTXTask = async (creator:string,newCCTXTask:Types.ITaskITO) => {
    const task = new Task({
      creator,
      info:{},
      meta:{},
      notes:[],
      tasks:[],
      ...newCCTXTask
    });
    await task.saveMe();
    await AppUsage.make(`prf/${creator}`,"createdTask",{which:`tsk/${task.id}`});
    return {task};
  };
  static getCCTXTaskById = async (creator:string,taskId:string) => {
    const task = await Task.findById(taskId);
    if(!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    await AppUsage.make(`prf/${creator}`,"fetchTask",{which:`tsk/${task.id}`});
    return {task};
  };
  static updateCCTXTask = async (
    creator:string,
    taskId:string,
    {notes,...updates}:Partial<Types.ITask>) => {
    const task = await Task.findByIdAndUpdate(taskId,{$set:updates},queryOpts);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    await AppUsage.make(`prf/${creator}`,"updatedTask",{which:`tsk/${task.id}`});
    return {task};
  };
  static deleteCCTXTask = async (creator:string,taskId:string) => {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await AppUsage.make(`prf/${creator}`,"deletedTask",{which:`tsk/${task.id}`});
    return {ok:true};
  };
  static updateCCTXTaskStatus = async (
    taskId:string,
    {status,reason,progress,priority}:Partial<{
    status:Types.ITaskStatuses,
    reason:string,
    progress:number,
    priority:1|2|3|4
  }>) => {
    const $set = {
      ...status?{status}:{},
      ...reason?{reason}:{},
      ...progress?{progress}:{},
      ...priority?{priority}:{},
    };
    const task = await Task.findByIdAndUpdate(taskId,{$set},queryOpts);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    return {task};
  };
  static addUpdateToCCTXTask = async (
    taskId:string,
    type:"note",
    item:
    Types.ITask["notes"][0]
    ) => {
    const type_ = `${type}s` as "notes";
    const task = await Task.findByIdAndUpdate(taskId,{$push:{[type_]:item}},queryOpts);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    return {task};
  };
  static removeUpdateFromCCTXTask = async (taskId:string,type:"note",j:number) => {
    const type_ = `${type}s` as "notes";
    const task = await Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task[type_] = task[type_].filter((o,i) => i !== j) as any[];
    await task.saveMe();
    return {task};
  };
  static finalizeCCTXTask = async (creator:string,taskId:string,{status,reason,resolution}:{
    status:Types.ITaskStatuses,
    resolution:string,//Partial<Types.ICCTXTaskDetails>,
    reason:string}) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');

    task.status = status;
    task.resolution = resolution;
    task.reason = reason;
    //task.invoice = CCTXTasksService.generateInvoice(task);
    await task.saveMe();
    await AppUsage.make(`prf/${creator}`,"finalizedTask",{which:`tsk/${task.id}`});
    return {task};
  };
  static closeCCTXTask = async (taskId:string) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    
    await task.saveMe();
    await AppUsage.make(`sys-admn`,"closedTask",{which:`tsk/${task.id}`});
    return {task};
  };
}