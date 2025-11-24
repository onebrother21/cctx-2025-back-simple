import UpcentricModels from "../../models";
import UpcentricTypes from "../../types";

import Models from "../../../../models";
import Types from "../../../../types";
import Utils from '../../../../utils';
import Services from '../../../../services';

import axios from 'axios';


const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const locationIQUrl = process.env.LOCATION_IQ_URL;
const locationIQKey = process.env.LOCATION_IQ_KEY;
const {
  NEW,
  OPEN,
  IN_PROGRESS,
  CLOSED,
} = UpcentricTypes.ITaskStatuses;

export class TasksService {
  // 📌 Task CRUD Ops
  static createTasks = async (creator:string,newTasks:Partial<UpcentricTypes.ITask>[]) => {
    const tasks:UpcentricTypes.ITask[] = [];
    for(let i = 0,l = newTasks.length;i<l;i++){
      const nt = {creator,...newTasks[i]};
      const task = new UpcentricModels.Task(nt);
      await task.saveMe();
      tasks.push(task);
    }
    return {tasks};
  };
  static createTask = async (creator:string,newTask:UpcentricTypes.ITaskITO) => {
    const task = new UpcentricModels.Task({creator,meta:{},...newTask});
    await task.saveMe();
    return {task};
  };
  static getTaskById = async (taskId:string) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if(!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    return {task};
  };
  static updateTask = async (taskId:string,{notes,...updates}:any) => {
    const task = await UpcentricModels.Task.findByIdAndUpdate(taskId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    return {task};
  };
  static deleteTask = async (taskId:string) => {
    const task = await UpcentricModels.Task.findByIdAndDelete(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    return {ok:true};
  };

  // 📌 Task Profile CRUD Ops
  static createProfile = async (creator:string,newProfile:Partial<Types.IProfile>) =>  {
    if(newProfile.addrs) newProfile.addrs = await TasksService.lookupAddresses(newProfile.addrs);
    const profile = await Models.Profile.create(newProfile);
    return {profile};
  };

  // Task Updates
  static updateTaskStatus = async (
    admin:string,
    taskId:string,
    {progress,priority,...o}:UpcentricTypes.ITask["log"][0] & {progress?:number,priority?:number}) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if(!task) throw new Utils.AppError(422,'Requested task not found');
    if(priority) task.priority = priority;
    if(progress) task.progress = progress;
    await task.saveMe({...o,time:new Date()});
    return {task};
  };
  static addFilesToTask = async (taskId:string,files:UpcentricTypes.ITask["files"]) => {
    const task = await UpcentricModels.Task.findByIdAndUpdate(taskId,
      { $push: { files }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    return {task};
  };
  static removeFileFromTask = async (taskId:string,fileIdx:number) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.files = task.files.filter((o,i) => i !== fileIdx);
    await task.saveMe();
    return {task};
  };
  static assignAdminToTask = async (taskId:string,adminId:string) => {
    const task = await UpcentricModels.Task.findById(taskId);
    task.admin = adminId as any;
    task.meta.assigned = new Date();
    const update = {
      status:IN_PROGRESS,
      action:"task assigned, status changed to 'in-progress'",
      user:"sys-admn",
      time:new Date()
    };
    await task.saveMe(update);
    return {task};
  };
  static unassignAdminFromTask = async (taskId:string) => {
    const task = await UpcentricModels.Task.findById(taskId);
    task.admin = null,
    task.meta.assigned = null;
    const update = {
      status:OPEN,
      action:"task unassigned, status changed to 'open'",
      user:"sys-admn",
      time:new Date()
    };
    await task.saveMe(update);
    return {task};
  };

  // 📌 Task Resolution & Invoicing
  static finalizeTask = async (taskId:string,{status,reason,resolution}:{
    status:UpcentricTypes.ITaskStatuses,
    resolution:string,//Partial<Types.ITaskDetails>,
    reason:string}) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.resolution = resolution;
    task.reason = reason;
    const update = {
      status,
      action:`status changed to '${status}'`,
      user:"sys-admn",
      time:new Date()
    };
    //task.invoice = TasksService.generateInvoice(task);
    await task.saveMe(update);
    return {task};
  };
  static closeTask = async (taskId:string) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    //if (task.status == CLOSED || !task.invoice.meta.paid) throw new Utils.AppError(422,'Requested task cannot be closed');
    
    const update = {
      status:CLOSED,
      action:`status changed to '${CLOSED}'`,
      user:"sys-admn",
      time:new Date()
    };
    await task.saveMe(update);
    return {task};
  };

  // 📌 Task Helpers
  static calculateMileage = ([lon1,lat1],[lon2,lat2]) => {
    const r = 3963.0; // mi
    const p = Math.PI / 180;
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
    return 2 * r * Math.asin(Math.sqrt(a));
  };
  static lookupAddresses = async (addrs:AddressObj[]) => {
    for(let i = 0,j = addrs.length;i<j;i++){
      let addr = addrs[i];
      const queryStr = `key=${locationIQKey}`+
      `${addr.streetAddr?"&street="+addr.streetAddr:""}`+
      `${addr.city?"&city="+addr.city:""}`+
      `${addr.state?"&state="+addr.state:""}`+
      `${addr.postal?"&postalCode="+addr.postal:""}`+
      `${addr.country?"&country="+addr.country:""}`+
      `&format=json`;
      const options = {
        method: 'GET',
        url:locationIQUrl+queryStr,
        headers: {accept: 'application/json'}
      };
      try {
        const res = await axios.request(options);
        if(res.data && res.data[0] && res.data[0].display_name){
          const {lat,lon,display_name} = res.data[0];
          const allNumArray = display_name.replaceAll(" ","").split(",").filter((s:string) => /^[0-9]+$/.test(s));
          addr.postal = allNumArray[allNumArray.length - 1];
          addr.info = display_name,
          addr.loc = {type:"Point",coordinates:[lon,lat]};
        }
      }
      catch(err){console.error(err);}
      addrs[i] = addr;
    }
    return addrs;
  };
}