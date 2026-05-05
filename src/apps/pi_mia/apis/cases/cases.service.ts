import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import PiMiaModels from "../../models";
import PiMiaTypes from "../../types";
import { uploadFields } from "@middleware";
import { QueryOptions } from 'mongoose';

const notify = Services.Notifications.createNotification;
const {LocationHelpers} = Services;

const queryOpts:QueryOptions = { returnDocument:"after",runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const {NEW,ACTIVE,ASSIGNED,CLOSED} = PiMiaTypes.ICaseStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Case} = PiMiaModels;
const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class CasesService {
  // 📌 Case CRUD Ops
  static createCases = async (creator:string,newCases:Partial<PiMiaTypes.ICase>[]) => {
    const pimiaCases:PiMiaTypes.ICase[] = [];
    for(let i = 0,l = newCases.length;i<l;i++){
      const nt = {creator,...newCases[i]};
      const pimiaCase = new Case(nt);
      await pimiaCase.saveMe();
      pimiaCases.push(pimiaCase);
    }
    await AppUsage.make(`prf/${creator}`,"createdCases");
    return {pimiaCases};
  };
  static createCase = async (creator:string,newCase:PiMiaTypes.ICaseITO) => {
    const pimiaCase = new Case({
      creator,
      meta:{},
      ledger:[],
      notes:[],
      hands:[],
      ...newCase
    });
    await pimiaCase.saveMe();
    await AppUsage.make(`prf/${creator}`,"createdCase",{which:`ssn/${pimiaCase.id}`});
    return {pimiaCase};
  };
  static getCaseById = async (creator:string,caseId:string) => {
    const pimiaCase = await Case.findById(caseId);
    if(!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    await pimiaCase.populateMe();
    await AppUsage.make(`prf/${creator}`,"fetchCase",{which:`ssn/${pimiaCase.id}`});
    return {pimiaCase};
  };
  static updateCase = async (
    creator:string,
    caseId:string,
    {notes,...updates}:Partial<PiMiaTypes.ICase>) => {
    const pimiaCase = await Case.findByIdAndUpdate(caseId,{$set:updates},queryOpts);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    await pimiaCase.populateMe();
    await AppUsage.make(`prf/${creator}`,"updatedCase",{which:`ssn/${pimiaCase.id}`});
    return {pimiaCase};
  };
  static deleteCase = async (creator:string,caseId:string) => {
    const pimiaCase = await Case.findByIdAndDelete(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    await AppUsage.make(`prf/${creator}`,"deletedCase",{which:`ssn/${pimiaCase.id}`});
    return {ok:true};
  };
  static updateCaseStatus = async (
    caseId:string,
    status:PiMiaTypes.ICaseStatuses) => {
    const pimiaCase = await Case.findByIdAndUpdate(caseId,{$set:{status}},queryOpts);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    await pimiaCase.populateMe();
    return {pimiaCase};
  };
  static addUpdateToCase = async (
    caseId:string,
    type:"note",
    item:
    PiMiaTypes.ICase["notes"][0]
    ) => {
    const type_ = `${type}s`;//type == "ledger"?type:`${type}s` as "ledger"|"notes"|"hands";
    const pimiaCase = await Case.findByIdAndUpdate(caseId,{$push:{[type_]:item}},queryOpts);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    await pimiaCase.populateMe();
    return {pimiaCase};
  };
  static removeUpdateFromCase = async (caseId:string,type:"note",j:number) => {
    const type_ = `${type}s`;//type == "ledger"?type:`${type}s` as "ledger"|"notes"|"hands";
    const pimiaCase = await Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    pimiaCase[type_ as "notes"] = pimiaCase[type_ as "notes"].filter((o,i) => i !== j) as any[];
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  // Case AddOns & Assignment
  static addFilesToCase = async (caseId:string,files:PiMiaTypes.ICase["files"]) => {
    const pimiaCase = await PiMiaModels.Case.findByIdAndUpdate(caseId,
      { $push: { files }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if(!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static removeFileFromCase = async (caseId:string,fileIdx:number) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.files = pimiaCase.files.filter((o,i) => i !== fileIdx);
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static addSubjectsToCase = async (caseId:string,subjects:PiMiaTypes.ICase["subjects"]) => {
    const pimiaCase = await PiMiaModels.Case.findByIdAndUpdate(caseId,
      { $push: { subjects }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static updateSubject = async (caseId:string,subjectIdx:number,{addrs,...updates}:any) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    updates.addrs = await Utils.lookupAddresses(addrs);
    const subjectId = pimiaCase.subjects[subjectIdx];
    const subject = await Models.Profile.findByIdAndUpdate(subjectId,
      { $set: updates},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!subject) throw new Utils.AppError(422,'Requested subject not found');
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static removeSubjectFromCase = async (caseId:string,subjectIdx:number) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.subjects = pimiaCase.subjects.filter((o,i) => i !== subjectIdx);
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static addSubjectAddresses = async (caseId:string,subjectIdx:number,addrs:AddressObj[]) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    const subjectId = pimiaCase.subjects[subjectIdx];
    const subject = await Models.Profile.findByIdAndUpdate(subjectId,
      { $push: { addrs:await Utils.lookupAddresses(addrs)}},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!subject) throw new Utils.AppError(422,'Requested subject not found');
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static addDetailsToCase = async (caseId:string,details:PiMiaTypes.ICase["meta"]) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.info = {...pimiaCase.info,...details};
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static assignAdminToCase = async (caseId:string,adminId:string) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if(!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.admin = adminId as any,pimiaCase.assignedOn = new Date();
    pimiaCase.status = ASSIGNED;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static unassignAdminFromCase = async (caseId:string) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if(!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.admin = null as any,
    pimiaCase.assignedOn = null as any;
    pimiaCase.status = ACTIVE;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };

  // 📌 Case Notation
  static addNotes = async (caseId:string,notes:Types.IMessage[]) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.notes.push(...notes);
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static updateNote = async (caseId:string,noteIdx:number,note:Types.IMessage) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.notes[noteIdx] = note;
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static removeNote = async (caseId:string,noteIdx:number) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.notes = pimiaCase.notes.filter((o,i) => i !== noteIdx);
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };

  // 📌 Case Attempts
  static startAttempt = async (caseId:string,attempt:PiMiaTypes.ICaseAttempt) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.attempts.push(attempt);
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static updateAttempt = async (caseId:string,attemptIndex:number) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.attempts = pimiaCase.attempts.filter((o,i) => 1 !== attemptIndex);
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static finalizeAttempt = async (
    caseId:string,
    attemptIndex:number,
    attemptData?:Partial<{end:Date;outcome:string,mileageAdj:number}>
  ) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    await pimiaCase.populateMe();
    const attempt = pimiaCase.attempts[attemptIndex];
    const admin = pimiaCase.admin;
    const returnHm = admin.meta.includeReturnHmOnAttempts;
    const hmBase = admin.contact.addrs[0].loc;
    const homeBase = (hmBase as any).coordinates;
    const delta = [];
    const stops = attempt.log.filter(o => o.type == "stop");
    for(let i = 0,l = stops.length;i<l;i++){
      const {loc} = stops[i];
      if(homeBase && loc) switch(true){
        case !i:{
          delta.push(LocationHelpers.calculateMileage(loc,homeBase));
          break;
        }
        default:{
          const {loc:lastLoc} = stops[i - 1];
          delta.push(LocationHelpers.calculateMileage(loc,lastLoc));
          if(i == (l - 1) && returnHm) delta.push(LocationHelpers.calculateMileage(loc,homeBase));
          break;
        }
      }
    }
    attempt.outcome = attemptData?.outcome || attempt.outcome || "none provided.";
    attempt.end = attemptData?.end || attempt.end || new Date();
    attempt.meta = {
      ...attempt.meta,
      mileage:delta.reduce((o,p) => o+p,0),
      mileageAdj:attemptData?.mileageAdj || attempt.meta.mileageAdj || 0,
      elapsedTime:new Date(attempt.end).getTime() - new Date(attempt.start).getTime()
    };
    pimiaCase.attempts[attemptIndex] = attempt;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static removeAttempt = async (caseId:string,attemptIndex:number) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    pimiaCase.attempts = pimiaCase.attempts.filter((o,i) => i !== attemptIndex);
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  
  // 📌 Case Artifacts - Stops, Interviews, Uploads, Notes
  static addAttemptActivity = async (caseId:string,attemptIndex:number,o:PiMiaTypes.ICaseArtifactPre) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    await pimiaCase.populateMe();
    let n:Partial<PiMiaTypes.ICaseArtifact>;
    switch(o.type){
      case "stop":{
        const subject = pimiaCase.subjects[o.subjectIdx];
        const addr = subject.contact.addrs[o.addrIdx];
        const addrLoc = (addr.loc as any).coordinates;
        const dist = LocationHelpers.calculateMileage(o.loc,addrLoc);
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
        const meta = uploadFields.reduce((n,k) => ({...n,[k]:o[k as keyof UploadResponse]}),{}) as any;
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
    pimiaCase.attempts[attemptIndex].log.push(n as PiMiaTypes.ICaseArtifact);
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static removeAttemptActivity = async (caseId:string,attemptIndex:number,logIdx:number) => {
    const pimiaCase = await PiMiaModels.Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested case not found');
    const attempt = pimiaCase.attempts[attemptIndex];
    attempt.log = attempt.log.filter((o,i) => logIdx !== i);
    pimiaCase.attempts[attemptIndex] = attempt;
    pimiaCase.status == NEW?pimiaCase.status = ACTIVE:null;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };

  // 📌 Case Resolution & Invoicing
  
  static finalizeCase = async (creator:string,caseId:string,{status,reason,resolution}:{
    status:PiMiaTypes.ICaseStatuses,
    resolution:string,//Partial<Types.ICaseDetails>,
    reason:string}) => {
    const pimiaCase = await Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    
    const update = {
      status,
      action:`status changed to '${status}'`,
      user:"sys-admn",
      time:new Date()
    };
    pimiaCase.status = status;
    pimiaCase.resolution = resolution;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
  static closeCase = async (creator:string,caseId:string) => {
    const pimiaCase = await Case.findById(caseId);
    if (!pimiaCase) throw new Utils.AppError(422,'Requested pimiaCase not found');
    if (pimiaCase.status == CLOSED || !pimiaCase.invoice.meta.paid) throw new Utils.AppError(422,'Requested pimiaCase cannot be closed');
    
    const update = {
      status:CLOSED,
      action:`status changed to '${CLOSED}'`,
      user:"sys-admn",
      time:new Date()
    };
    pimiaCase.status = CLOSED;
    await pimiaCase.saveMe();
    return {pimiaCase};
  };
}
export default CasesService;