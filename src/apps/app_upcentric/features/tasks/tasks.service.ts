import UpcentricModels from "../../models";
import UpcentricTypes from "../../types";

import Models from "../../../../models";
import Types from "../../../../types";
import Utils from '../../../../utils';
import Services from '../../../../services';
import { uploadFields } from "../../../../middlewares";

import axios from 'axios';

const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const locationIQUrl = process.env.LOCATION_IQ_URL;
const locationIQKey = process.env.LOCATION_IQ_KEY;
const {
  NEW,
  OPEN,
  OPEN_CRIT,
  IN_PROGRESS,
  IN_PROGRESS_CRIT,
  CLOSED,
} = UpcentricTypes.ITaskStatuses;

export class TasksService {
  // 📌 Task CRUD Ops
  static createTask = async (creator:string,newTask:Partial<UpcentricTypes.ITask>) => {
    const task = new UpcentricModels.Task({creator,...newTask});
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
  static updateTaskStatus = async (admin:string,taskId:string,{name,info}:{name:UpcentricTypes.ITaskStatuses,info?:any}) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    if(info) task.notes.push({user:admin,msg:info,time:new Date()});
    await task.saveMe(name,info);
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
  static addDetailsToTask = async (taskId:string,details:UpcentricTypes.ITask["meta"]) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.meta = {...task.meta,...details};
    await task.saveMe();
    return {task};
  };
  static assignAdminToTask = async (taskId:string,adminId:string) => {
    const task = await UpcentricModels.Task.findById(taskId);
    task.admin = adminId as any;
    task.assignedOn = new Date();
    await task.saveMe(/crit/.test(task.status)?IN_PROGRESS_CRIT:IN_PROGRESS);
    return {task};
  };
  static unassignAdminFromTask = async (taskId:string) => {
    const task = await UpcentricModels.Task.findById(taskId);
    task.admin = null,task.assignedOn = null;
    await task.saveMe(/crit/.test(task.status)?OPEN_CRIT:OPEN);
    return {task};
  };

  // 📌 Task Notation
  static addNotes = async (taskId:string,notes:UpcentricTypes.ITaskNote[]) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.notes.push(...notes);
    await task.saveMe();
    return {task};
  };
  static updateNote = async (taskId:string,noteIdx:number,note:UpcentricTypes.ITaskNote) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.notes[noteIdx] = note;
    await task.saveMe();
    return {task};
  };
  static removeNote = async (taskId:string,noteIdx:number) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.notes = task.notes.filter((o,i) => i !== noteIdx);
    await task.saveMe();
    return {task};
  };

  /*
  // 📌 Task Attempts
  static startAttempt = async (taskId:string,attempt:Types.ITask["attempts"][0]) => {
    const task = await Models.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.attempts.push(attempt);
    await (task.status == ACTIVE?task.saveMe(IN_PROGRESS):task.saveMe());
    return {task};
  };
  static updateAttempt = async (taskId:string,attemptIndex:number) => {
    const task = await Models.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.attempts = task.attempts.filter((o,i) => 1 !== attemptIndex);
    await task.saveMe();
    return {task};
  };
  static finalizeAttempt = async (taskId:string,attemptIndex:number,attemptData?:Partial<{end:Date;outcome:string,mileageAdj:number}>) => {
    const task = await Models.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    const attempt = task.attempts[attemptIndex];
    const homeBase = task.admin.addrs[0].loc.coordinates;
    const delta = [];
    const stops = attempt.log.filter(o => o.type == "stop");
    for(let i = 0,l = stops.length;i<l;i++){
      const {loc} = stops[i];
      if(!i) delta.push(homeBase && loc?TasksService.calculateMileage(loc,homeBase):0);
      if(i){
        const {loc:lastLoc} = stops[i - 1];
        delta.push(TasksService.calculateMileage(loc,lastLoc));
      }
      if(i == (l - 1)) delta.push(homeBase && loc?TasksService.calculateMileage(loc,homeBase):0);
    }
    attempt.outcome = attemptData?.outcome || attempt.outcome || "none provided.";
    attempt.end = attemptData?.end || attempt.end || new Date();
    attempt.meta = {
      ...attempt.meta,
      mileage:delta.reduce((o,p) => o+p,0),
      mileageAdj:attemptData?.mileageAdj || attempt.meta.mileageAdj || 0,
      elapsedTime:new Date(attempt.end).getTime() - new Date(attempt.start).getTime()
    };
    task.attempts[attemptIndex] = attempt;
    await task.saveMe();
    return {task};
  };
  static removeAttempt = async (taskId:string,attemptIndex:number) => {
    const task = await Models.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    task.attempts = task.attempts.filter((o,i) => i !== attemptIndex);
    await task.saveMe();
    return {task};
  }
  
  // 📌 Task Artifacts - Stops, Interviews, Uploaads, Notes
  static addAttemptActivity = async (taskId:string,attemptIndex:number,o:Types.ITaskArtifactPre) => {
    const task = await Models.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    let n:Partial<Types.ITaskArtifact>;
    switch(o.type){
      case "stop":{
        const addr = task.subjects[o.subjectIdx].addrs[o.addrIdx];
        const dist = TasksService.calculateMileage(o.loc,addr.loc.coordinates);
        const atLoc = dist <= .05;
        n = {
          ...o,
          addr:addr.info,
          meta:{
            ...o.meta,
            ...atLoc?{verification:{
              atLoc,
              within:dist.toFixed(3) + " mi" as any,
              time:new Date(),
              hash:Utils.longId(),
            }}:{},
          }
        };
        break;
      }
      case "upload":{
        const meta = uploadFields.reduce((n,k) => ({...n,[k]:o[k]}),{}) as any;
        //const m = o as ;
        n = {
          id:o.public_id,
          type:o.type,
          time:o.original_date,
          url:o.secure_url,
          meta
        };
        break;
      }
      default:{n = {...o};break;}
    }
    
    task.attempts[attemptIndex].log.push(n as Types.ITaskArtifact);
    await task.saveMe();
    return {task};
  };
  static removeAttemptActivity = async (taskId:string,attemptIndex:number,logIdx:number) => {
    const task = await Models.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    const attempt = task.attempts[attemptIndex];
    attempt.log = attempt.log.filter((o,i) => logIdx !== i);
    task.attempts[attemptIndex] = attempt;
    await task.saveMe();
    return {task};
  };
  */

  // 📌 Task Resolution & Invoicing
  static finalizeTask = async (taskId:string,{status:name,reason,resolution}:{
    status:UpcentricTypes.ITaskStatuses,
    resolution:string,//Partial<Types.ITaskDetails>,
    reason:string}) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    await task.populateMe();
    task.resolution = resolution;
    task.reason = reason;
    task.meta = {...task.meta};
    //task.invoice = TasksService.generateInvoice(task);
    await task.saveMe(name,{reason,resolution});
    return {task};
  };
  static closeTask = async (taskId:string) => {
    const task = await UpcentricModels.Task.findById(taskId);
    if (!task) throw new Utils.AppError(422,'Requested task not found');
    //if (task.status == CLOSED || !task.invoice.meta.paid) throw new Utils.AppError(422,'Requested task cannot be closed');
    await task.saveMe(CLOSED);
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