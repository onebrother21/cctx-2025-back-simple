import UpcentricModels from "../../models";
import UTypes from "../../types";

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
  IN_PROGRESS,
  CLOSED,
} = UTypes.IBugStatuses;

export class BugsService {
  // 📌 Bug CRUD Ops
  static createBugs = async (creator:string,newBugs:Partial<UTypes.IBug>[]) => {
    const bugs:UTypes.IBug[] = [];
    for(let i = 0,l = newBugs.length;i<l;i++){
      const nt = {creator,...newBugs[i]};
      const bug = new UpcentricModels.Bug(nt);
      await bug.saveMe();
      bugs.push(bug);
    }
    return {bugs};
  };
  static createBug = async (creator:string,newBug:UTypes.IBugITO) => {
    const bug = new UpcentricModels.Bug({creator,meta:{},...newBug});
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
  static updateBugStatus = async (
    admin:string,
    bugId:string,
    {progress,priority,...o}:AppActivityUpdate & {progress?:number,priority?:number}) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if(!bug) throw new Utils.AppError(422,'Requested bug not found');
    if(priority) bug.priority = priority;
    if(progress) bug.progress = progress;
    await bug.saveMe({...o,time:new Date()});
    return {bug};
  };
  static addFilesToBug = async (bugId:string,files:UTypes.IBug["files"]) => {
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
  static assignAdminToBug = async (bugId:string,adminId:string) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    bug.admin = adminId as any;
    bug.meta.assigned = new Date();
    const update = {
      status:IN_PROGRESS,
      action:"bug assigned, status changed to 'in-progress'",
      user:"sys-admn",
      time:new Date()
    };
    await bug.saveMe(update);
    return {bug};
  };
  static unassignAdminFromBug = async (bugId:string) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    bug.admin = null,
    bug.meta.assigned = null;
    const update = {
      status:OPEN,
      action:"bug unassigned, status changed to 'open'",
      user:"sys-admn",
      time:new Date()
    };
    await bug.saveMe(update);
    return {bug};
  };

  // 📌 Bug Resolution & Invoicing
  static finalizeBug = async (bugId:string,{status,reason,resolution}:{
    status:UTypes.IBugStatuses,
    resolution:string,//Partial<Types.IBugDetails>,
    reason:string}) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    bug.resolution = resolution;
    bug.reason = reason;
    const update = {
      status,
      action:`status changed to '${status}'`,
      user:"sys-admn",
      time:new Date()
    };
    //bug.invoice = BugsService.generateInvoice(bug);
    await bug.saveMe(update);
    return {bug};
  };
  static closeBug = async (bugId:string) => {
    const bug = await UpcentricModels.Bug.findById(bugId);
    if (!bug) throw new Utils.AppError(422,'Requested bug not found');
    //if (bug.status == CLOSED || !bug.invoice.meta.paid) throw new Utils.AppError(422,'Requested bug cannot be closed');
    
    const update = {
      status:CLOSED,
      action:`status changed to '${CLOSED}'`,
      user:"sys-admn",
      time:new Date()
    };
    await bug.saveMe(update);
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