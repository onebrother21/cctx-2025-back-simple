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
} = UpcentricTypes.IBugStatuses;

export class BugsService {
  // 📌 Bug CRUD Ops
  static createBug = async (creator:string,newBug:Partial<UpcentricTypes.IBug>) => {
    const bug = new UpcentricModels.Bug({creator,...newBug});
    await bug.saveMe();
    return {bug};
  };
  static getBugById = async (bugId:string) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if(!bug) throw new Utils.AppError(422,'Requested bug not found');
    await bug.populateMe();
    return {bug};
  };
  static updateBug = async (bugId:string,{notes,...updates}:any) => {
    const bug = await UpcentricModels.Bug.findByIdAndUpdate(bugId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    await bug.populateMe();
    return {bug};
  };
  static deleteBug = async (bugId:string) => {
    const bug = await UpcentricModels.Bug.findByIdAndDelete(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    return {ok:true};
  };

  // 📌 Bug Profile CRUD Ops
  static createProfile = async (creator:string,newProfile:Partial<Types.IProfile>) =>  {
    if(newProfile.addrs) newProfile.addrs = await BugsService.lookupAddresses(newProfile.addrs);
    const profile = await Models.Profile.create(newProfile);
    return {profile};
  };

  // Bug Updates
  static updateBugStatus = async (admin:string,bugId:string,{name,info}:{name:UpcentricTypes.IBugStatuses,info?:any}) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    if(info) bug.notes.push({user:admin,msg:info,time:new Date()});
    await bug.saveMe(name,info);
    return {bug};
  };
  static addFilesToBug = async (bugId:string,files:UpcentricTypes.IBug["files"]) => {
    const bug = await UpcentricModels.Bug.findByIdAndUpdate(bugId,
      { $push: { files }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    await bug.populateMe();
    return {bug};
  };
  static removeFileFromBug = async (bugId:string,fileIdx:number) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.files = bug.files.filter((o,i) => i !== fileIdx);
    await bug.saveMe();
    return {bug};
  };
  static addDetailsToBug = async (bugId:string,details:UpcentricTypes.IBug["meta"]) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.meta = {...bug.meta,...details};
    await bug.saveMe();
    return {bug};
  };
  static assignAdminToBug = async (bugId:string,adminId:string) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    bug.admin = adminId as any;
    bug.assignedOn = new Date();
    await bug.saveMe(/crit/.test(bug.status)?IN_PROGRESS_CRIT:IN_PROGRESS);
    return {bug};
  };
  static unassignAdminFromBug = async (bugId:string) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    bug.admin = null,bug.assignedOn = null;
    await bug.saveMe(/crit/.test(bug.status)?OPEN_CRIT:OPEN);
    return {bug};
  };

  // 📌 Bug Notation
  static addNotes = async (bugId:string,notes:UpcentricTypes.IBugNote[]) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.notes.push(...notes);
    await bug.saveMe();
    return {bug};
  };
  static updateNote = async (bugId:string,noteIdx:number,note:UpcentricTypes.IBugNote) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.notes[noteIdx] = note;
    await bug.saveMe();
    return {bug};
  };
  static removeNote = async (bugId:string,noteIdx:number) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.notes = bug.notes.filter((o,i) => i !== noteIdx);
    await bug.saveMe();
    return {bug};
  };

  /*
  // 📌 Bug Attempts
  static startAttempt = async (bugId:string,attempt:Types.IBug["attempts"][0]) => {
    const bug = await Models.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.attempts.push(attempt);
    await (bug.status == ACTIVE?bug.saveMe(IN_PROGRESS):bug.saveMe());
    return {bug};
  };
  static updateAttempt = async (bugId:string,attemptIndex:number) => {
    const bug = await Models.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.attempts = bug.attempts.filter((o,i) => 1 !== attemptIndex);
    await bug.saveMe();
    return {bug};
  };
  static finalizeAttempt = async (bugId:string,attemptIndex:number,attemptData?:Partial<{end:Date;outcome:string,mileageAdj:number}>) => {
    const bug = await Models.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    await bug.populateMe();
    const attempt = bug.attempts[attemptIndex];
    const homeBase = bug.admin.addrs[0].loc.coordinates;
    const delta = [];
    const stops = attempt.log.filter(o => o.type == "stop");
    for(let i = 0,l = stops.length;i<l;i++){
      const {loc} = stops[i];
      if(!i) delta.push(homeBase && loc?BugsService.calculateMileage(loc,homeBase):0);
      if(i){
        const {loc:lastLoc} = stops[i - 1];
        delta.push(BugsService.calculateMileage(loc,lastLoc));
      }
      if(i == (l - 1)) delta.push(homeBase && loc?BugsService.calculateMileage(loc,homeBase):0);
    }
    attempt.outcome = attemptData?.outcome || attempt.outcome || "none provided.";
    attempt.end = attemptData?.end || attempt.end || new Date();
    attempt.meta = {
      ...attempt.meta,
      mileage:delta.reduce((o,p) => o+p,0),
      mileageAdj:attemptData?.mileageAdj || attempt.meta.mileageAdj || 0,
      elapsedTime:new Date(attempt.end).getTime() - new Date(attempt.start).getTime()
    };
    bug.attempts[attemptIndex] = attempt;
    await bug.saveMe();
    return {bug};
  };
  static removeAttempt = async (bugId:string,attemptIndex:number) => {
    const bug = await Models.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.attempts = bug.attempts.filter((o,i) => i !== attemptIndex);
    await bug.saveMe();
    return {bug};
  }
  
  // 📌 Bug Artifacts - Stops, Interviews, Uploaads, Notes
  static addAttemptActivity = async (bugId:string,attemptIndex:number,o:Types.IBugArtifactPre) => {
    const bug = await Models.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    await bug.populateMe();
    let n:Partial<Types.IBugArtifact>;
    switch(o.type){
      case "stop":{
        const addr = bug.subjects[o.subjectIdx].addrs[o.addrIdx];
        const dist = BugsService.calculateMileage(o.loc,addr.loc.coordinates);
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
    
    bug.attempts[attemptIndex].log.push(n as Types.IBugArtifact);
    await bug.saveMe();
    return {bug};
  };
  static removeAttemptActivity = async (bugId:string,attemptIndex:number,logIdx:number) => {
    const bug = await Models.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    const attempt = bug.attempts[attemptIndex];
    attempt.log = attempt.log.filter((o,i) => logIdx !== i);
    bug.attempts[attemptIndex] = attempt;
    await bug.saveMe();
    return {bug};
  };
  */

  // 📌 Bug Resolution & Invoicing
  static finalizeBug = async (bugId:string,{status:name,reason,resolution}:{
    status:UpcentricTypes.IBugStatuses,
    resolution:string,//Partial<Types.IBugDetails>,
    reason:string}) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    await bug.populateMe();
    bug.resolution = resolution;
    bug.reason = reason;
    bug.meta = {...bug.meta};
    //bug.invoice = BugsService.generateInvoice(bug);
    await bug.saveMe(name,{reason,resolution});
    return {bug};
  };
  static closeBug = async (bugId:string) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    //if (bug.status == CLOSED || !bug.invoice.meta.paid) throw new Utils.AppError(422,'Requested bug cannot be closed');
    await bug.saveMe(CLOSED);
    return {bug};
  };

  // 📌 Bug Helpers
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