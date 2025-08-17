import PiMiaModels from  "../../models";
import PiMiaTypes from "../../types";

import Models from '../../../../models';
import Types from "../../../../types";
import Utils from '../../../../utils';
import Services from '../../../../services';
import { uploadFields } from "../../../../middlewares";

const notify = Services.Notifications.createNotification;


import axios from 'axios';

const queryOpts = { new:true,runValidators: true,context:'query' };
const locationIQKey = process.env.LOCATION_IQ_KEY;
const {NEW,ACTIVE,ASSIGNED,COMPLETED,CANCELLED,PENDING,IN_PROGRESS,CLOSED} = PiMiaTypes.ICaseStatuses;

export class CasesService {
  // 📌 Case CRUD Ops
  static createCase = async (creator:string,newCase:Partial<PiMiaTypes.ICase>) => {
    const case_ = new PiMiaModels.Case({creator,...newCase});
    await case_.saveMe();
    return {case_};
  };
  static getCaseById = async (caseId:string) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if(!case_) throw new Utils.AppError(422,'Requested case not found');
    await case_.populateMe();
    return {case_};
  };
  static updateCase = async (caseId:string,{notes,...updates}:any) => {
    const case_ = await PiMiaModels.Case.findByIdAndUpdate(caseId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    await case_.populateMe();
    return {case_};
  };
  static deleteCase = async (caseId:string) => {
    const case_ = await PiMiaModels.Case.findByIdAndDelete(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    return {ok:true};
  };

  // 📌 Case Profile CRUD Ops
  static createProfile = async (creator:string,newProfile:Partial<PiMiaTypes.IProfile>) =>  {
    if(newProfile.addrs) newProfile.addrs = await CasesService.lookupAddresses(newProfile.addrs);
    const profile = await PiMiaModels.Profile.create(newProfile);
    return {profile};
  };
  
  // 📌 Case Queries
  static queryCases = async ({location,...query_}:any,select:string[],opts?:any,timestamp?:number) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;

    const {pts,radius = 5,unit = "mi"} = location || {};
    const searchRadius = radius/(unit == "mi"?3963.2:6371);
    const locationQ = {"subject.addrs.loc":{$geoWithin:{$centerSphere:[pts,searchRadius]}}};
    const query = {...query_,...(location?locationQ:{})};
    
    const pipeline:any[] = [];

    const projections = {
      creator:{id:"$creator._id",name:"$creator.name",username:"$creator.username" },
      client:{name:"$client.name",org:"$client.org"},
      vendor:{name:"$vendor.name",org:"$vendor.org"},
      admin:{name:"$admin.name",org:"$admin.org"},
      subject:{
        name:"$subject.name",
        type:"$subject.type",
        email:"$subject.emails",
        phn:"$subject.phns",
        addr:{info:"$subject.addrs.info",loc:"$subject.addrs.loc.coordinates"},
      },
    };
    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach(k => k !== "id"?o[k] = { $first: "$"+k }:null);
      Utils.log(o);
      return o;
    };
    const selectProjections = (fields:string[]) => {
      const o:any = {_id:0};
      fields.forEach(k => o[k] = k == "id"?"$_id":projections[k] || 1);
      Utils.info(o);
      return o;
    };
    const formatResultsWithDistCalc = (results:any[]) => results.map(o => {
      return {
        ...o,
        subject:{
          ...o.subject,
          ...location && o.subject.addr?{addr:{
            ...o.subject.addr,
            ...(select.includes("dist")?{dist:Utils.calculateDistance(pts,o.subject.addr.loc,{unit,toFixed:4})}:{}),
            ...(select.includes("distUnit")?{distUnit:unit}:{}),
          }}:{}
        }
      };
    });
    pipeline.push(
      { $lookup: {from: "users",localField: "creator",foreignField: "_id",as: "creator"}},
      { $unwind: "$creator"},
      { $lookup: {from: "profiles",localField: "client",foreignField: "_id",as: "client"}},
      { $unwind: "$client"},
      { $lookup: {from: "profiles",localField: "vendor",foreignField: "_id",as: "vendor"}},
      { $unwind: "$vendor"},
      { $lookup: {from: "profiles",localField: "admin",foreignField: "_id",as: "admin"}},
      { $unwind: "$admin"},
      { $lookup: {from: "profiles",localField: "subjects",foreignField: "_id",as: "subjects"}},
      { $unwind: "$subjects"},
      { $unwind: "$subjects.emails"},
      { $unwind: "$subjects.phns"},
      { $unwind:{path:"$subjects.addrs",preserveNullAndEmptyArrays: true}},
      { $addFields: {
        subject:"$subjects",
        created_on: { "$toDouble": "$createdOn" },
        assigned_on: { "$toDouble": "$assignedOn" },
        due_on: { "$toDouble": "$dueOn" },
        status: {$arrayElemAt:["$statusUpdates.name",-1]}//last status update
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $project:  selectProjections(select)},
    );
    Utils.trace({query});
    let results = formatResultsWithDistCalc(await PiMiaModels.Case.aggregate(pipeline));
    return { results };
  };
  static queryProfiles = async ({location,...query_}:any,select:string[],opts?:any,timestamp?:number) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;

    const {pts,radius = 5,unit = "mi"} = location || {};
    const searchRadius = radius/(unit == "mi"?3963.2:6371);
    const locationQ = {"addrs.loc":{"$geoWithin":{"$centerSphere":[pts,searchRadius]}}};

    const query = {...query_,...(location?locationQ:{})};
    const pipeline:any[] = [];

    const projections = {
      addr:{info:"$addrs.info",loc:"$addrs.loc.coordinates"},
    };
    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach(k => k !== "id"?o[k] = { $first: "$"+k }:null);
      Utils.log(o);
      return o;
    };
    const selectProjections = (fields:string[]) => {
      const o:any = {_id:0};
      fields.forEach(k => o[k] = k == "id"?"$_id":projections[k] || 1);
      Utils.info(o);
      return o;
    };
    const formatResultsWithDistCalc = (results:any[]) => results.map(o => {
      return {
        ...o,
        ...location && o.addr?{addr:{
          ...o.addr,
          ...(select.includes("dist")?{dist:Utils.calculateDistance(pts,o.addr.loc,{unit,toFixed:4})}:{}),
          ...(select.includes("distUnit")?{distUnit:unit}:{}),
        }}:{}
      };
    });
    pipeline.push(
      { $unwind:{
        path:"$addrs",
        "preserveNullAndEmptyArrays": true
      }},
      { $addFields: {
        addr:"$addrs",
        created_on: { "$toDouble": "$createdOn" },
        status: {$arrayElemAt:["$statusUpdates.name",-1]}//last status update
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $project:  selectProjections(select)},
    );
    
    Utils.trace({query});
    const results = formatResultsWithDistCalc(await PiMiaModels.Profile.aggregate(pipeline));
    return { results };
  };
  static queryInvoices = CasesService.queryCases;

  // Case AddOns & Assignment
  static updateCaseStatus = async (caseId:string,{name,info}:{name:PiMiaTypes.ICaseStatuses,info?:any}) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    await case_.saveMe(name,info);
    return {case_};
  };
  static addFilesToCase = async (caseId:string,files:PiMiaTypes.ICase["files"]) => {
    const case_ = await PiMiaModels.Case.findByIdAndUpdate(caseId,
      { $push: { files }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    await (case_.status == NEW?case_.saveMe(ACTIVE):case_.populateMe());
    return {case_};
  };
  static removeFileFromCase = async (caseId:string,fileIdx:number) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.files = case_.files.filter((o,i) => i !== fileIdx);
    await case_.saveMe();
    return {case_};
  };
  static addSubjectsToCase = async (caseId:string,subjects:PiMiaTypes.ICase["subjects"]) => {
    const case_ = await PiMiaModels.Case.findByIdAndUpdate(caseId,
      { $push: { subjects }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    await (case_.status == NEW?case_.saveMe(ACTIVE):case_.populateMe());
    return {case_};
  };
  static updateSubject = async (caseId:string,subjectIdx:number,{addrs,...updates}:any) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    updates.addrs = await CasesService.lookupAddresses(addrs);
    const subjectId = case_.subjects[subjectIdx];
    const subject = await PiMiaModels.Profile.findByIdAndUpdate(subjectId,
      { $set: updates},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!subject) throw new Utils.AppError(422,'Requested subject not found');
    await (case_.status == NEW?case_.saveMe(ACTIVE):case_.populateMe());
    return {case_};
  };
  static removeSubjectFromCase = async (caseId:string,subjectIdx:number) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.subjects = case_.subjects.filter((o,i) => i !== subjectIdx);
    await case_.saveMe();
    return {case_};
  };
  static addSubjectAddresses = async (caseId:string,subjectIdx:number,addrs:AddressObj[]) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    const subjectId = case_.subjects[subjectIdx];
    const subject = await PiMiaModels.Profile.findByIdAndUpdate(subjectId,
      { $push: { addrs:await CasesService.lookupAddresses(addrs)}},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!subject) throw new Utils.AppError(422,'Requested subject not found');
    await (case_.status == NEW?case_.saveMe(ACTIVE):case_.populateMe());
    return {case_};
  };
  static addDetailsToCase = async (caseId:string,details:PiMiaTypes.ICase["meta"]) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.meta = {...case_.meta,...details};
    await (case_.status == NEW?case_.saveMe(ACTIVE):case_.saveMe());
    return {case_};
  };
  static assignAdminToCase = async (caseId:string,adminId:string) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    case_.admin = adminId as any,case_.assignedOn = new Date();
    await case_.saveMe(ASSIGNED);
    return {case_};
  };
  static unassignAdminFromCase = async (caseId:string) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    case_.admin = null,case_.assignedOn = null;
    await case_.saveMe(ACTIVE);
    return {case_};
  };

  // 📌 Case Notation
  static addNotes = async (caseId:string,notes:PiMiaTypes.ICaseNote[]) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.notes.push(...notes);
    await (case_.status == NEW?case_.saveMe(ACTIVE):case_.saveMe());
    return {case_};
  };
  static updateNote = async (caseId:string,noteIdx:number,note:PiMiaTypes.ICaseNote) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.notes[noteIdx] = note;
    await case_.saveMe();
    return {case_};
  };
  static removeNote = async (caseId:string,noteIdx:number) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.notes = case_.notes.filter((o,i) => i !== noteIdx);
    await case_.saveMe();
    return {case_};
  };

  // 📌 Case Attempts
  static startAttempt = async (caseId:string,attempt:PiMiaTypes.ICase["attempts"][0]) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.attempts.push(attempt);
    await (case_.status == ACTIVE?case_.saveMe(IN_PROGRESS):case_.saveMe());
    return {case_};
  };
  static updateAttempt = async (caseId:string,attemptIndex:number) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.attempts = case_.attempts.filter((o,i) => 1 !== attemptIndex);
    await case_.saveMe();
    return {case_};
  };
  static finalizeAttempt = async (caseId:string,attemptIndex:number,attemptData?:Partial<{end:Date;outcome:string,mileageAdj:number}>) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    await case_.populateMe();
    const attempt = case_.attempts[attemptIndex];
    const homeBase = case_.admin.addrs[0].loc.coordinates;
    const delta = [];
    const stops = attempt.log.filter(o => o.type == "stop");
    for(let i = 0,l = stops.length;i<l;i++){
      const {loc} = stops[i];
      if(!i) delta.push(homeBase && loc?CasesService.calculateMileage(loc,homeBase):0);
      if(i){
        const {loc:lastLoc} = stops[i - 1];
        delta.push(CasesService.calculateMileage(loc,lastLoc));
      }
      if(i == (l - 1)) delta.push(homeBase && loc?CasesService.calculateMileage(loc,homeBase):0);
    }
    attempt.outcome = attemptData?.outcome || attempt.outcome || "none provided.";
    attempt.end = attemptData?.end || attempt.end || new Date();
    attempt.meta = {
      ...attempt.meta,
      mileage:delta.reduce((o,p) => o+p,0),
      mileageAdj:attemptData?.mileageAdj || attempt.meta.mileageAdj || 0,
      elapsedTime:new Date(attempt.end).getTime() - new Date(attempt.start).getTime()
    };
    case_.attempts[attemptIndex] = attempt;
    await case_.saveMe();
    return {case_};
  };
  static removeAttempt = async (caseId:string,attemptIndex:number) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.attempts = case_.attempts.filter((o,i) => i !== attemptIndex);
    await case_.saveMe();
    return {case_};
  };
  
  // 📌 Case Artifacts - Stops, Interviews, Uploaads, Notes
  static addAttemptActivity = async (caseId:string,attemptIndex:number,o:PiMiaTypes.ICaseArtifactPre) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    await case_.populateMe();
    let n:Partial<PiMiaTypes.ICaseArtifact>;
    switch(o.type){
      case "stop":{
        const addr = case_.subjects[o.subjectIdx].addrs[o.addrIdx];
        const dist = CasesService.calculateMileage(o.loc,addr.loc.coordinates);
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
    
    case_.attempts[attemptIndex].log.push(n as PiMiaTypes.ICaseArtifact);
    await case_.saveMe();
    return {case_};
  };
  static removeAttemptActivity = async (caseId:string,attemptIndex:number,logIdx:number) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    const attempt = case_.attempts[attemptIndex];
    attempt.log = attempt.log.filter((o,i) => logIdx !== i);
    case_.attempts[attemptIndex] = attempt;
    await case_.saveMe();
    return {case_};
  };

  // 📌 Case Resolution & Invoicing
  static finalizeCase = async (caseId:string,{status:name,reason,resolution}:{
    status:PiMiaTypes.ICaseStatuses,
    resolution:Partial<PiMiaTypes.ICaseDetails>,
    reason:string}) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    await case_.populateMe();
    case_.meta = {...case_.meta,...resolution};
    case_.invoice = CasesService.generateInvoice(case_);
    await case_.saveMe(name,{reason,resolution});
    return {case_};
  };
  static closeCase = async (caseId:string) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if (!case_) throw new Utils.AppError(422,'Requested case not found');
    if (case_.status == CLOSED || !case_.invoice.meta.paid) throw new Utils.AppError(422,'Requested case cannot be closed');
    await case_.saveMe(CLOSED);
    return {case_};
  };
  static generateInvoice = ({
    id:caseId,reqNo:invoiceNo,
    objective:objective_,
    meta,subjects,attempts,
    admin:{meta:{rateAmt,rateUnit,mileageRate}}
  }:PiMiaTypes.ICase):PiMiaTypes.ICaseInvoice => {
    const primary = subjects.filter(o => o.meta.type == "primary")[0];
    const objective = objective_ == "full"?"Full Investigation":"Other";
    const title = `JOB: ${Utils.capWSpaces(primary.name)} - ${objective}`;
    const invoice:PiMiaTypes.ICaseInvoice = {title,caseId,invoiceNo} as any;
    const items:any[] = [];
    for(let i = 0,j = attempts.length;i<j;i++){
      const attempt = attempts[i];
      let descArr = [`${new Date(attempt.start).toDateString()} - Reviewed assignment.`];
      for(let k = 0,l = attempt.log.length;k<l;k++) descArr.push(...CasesService.generateInvoiceDesc(subjects,attempt.log[k]));
      const duration = attempt.meta.elapsedTime/(1000 * 60 * 60),
      durationStr = duration.toFixed(1) + " hr",
      serviceCharges = rateUnit == "attempt"?rateAmt * (i + 1):rateUnit == "hr"?rateAmt * duration:0,
      serviceChg = "$ "+serviceCharges.toFixed(2),
      mileage = attempt.meta.mileage,
      mileageStr = mileage.toFixed(2) + " mi",
      mileageCharges = (mileageRate || 0) * mileage,
      mileageChg = "$ "+mileageCharges.toFixed(2),
      mileageAdj = attempt.meta.mileageAdj,
      mileageAdjStr = mileageAdj.toFixed(2) + " mi",
      mileageAdjCharges = (mileageRate || 0) * mileageAdj,
      mileageAdjChg = "$ "+mileageAdj.toFixed(2),
      totalCharges = serviceCharges + mileageCharges + mileageAdjCharges,
      totalChg = "$ "+totalCharges.toFixed(2),
      actions = descArr,
      desc = descArr.join(" ");

      items.push({
        type:"attempt",
        desc,
        actions,
        duration,
        durationStr,
        serviceCharges,
        serviceChg,
        mileage,
        mileageStr,
        mileageCharges,
        mileageChg,
        mileageAdj,
        mileageAdjStr,
        mileageAdjCharges,
        mileageAdjChg,
        totalCharges,
        totalChg,
      });
    }
    invoice.meta = {submitted:new Date()} as any;
    invoice.items = items;
    invoice.subtotal = items.reduce((o:number,p:any) => o + p.totalCharges,0);
    invoice.tax = invoice.subtotal * .065;
    invoice.total = invoice.subtotal + invoice.tax;
    return invoice;
  };
  static generateInvoiceDesc = (
    subjects:PiMiaTypes.IProfile[],
    logItem:PiMiaTypes.ICaseAttempt["log"][0]
  ) => {
    const descArr:string[] = [];
    switch(logItem.type){
      case "stop":{
        const {addrIdx,subjectIdx,addr,loc,meta:{vehiclesPresent,leftAttyLetter,verification}} = logItem;
        const attemptAddr = subjects[subjectIdx].addrs[addrIdx];
        const addrStr = `Drove to ${attemptAddr.streetAddr} in ${attemptAddr.city}, ${attemptAddr.state}.`;
        const verified = verification.time;
        const verificationStr = `Location: ${loc} @ ${verified}`;
        descArr.push(addrStr,verificationStr);

        if(leftAttyLetter) descArr.push(`Left atty letter taped to the door.`);
        if(vehiclesPresent.length){
          let vehicles = "Vehicles Present: ";
          for(let m = 0,n = vehiclesPresent.length;m<n;m++){
            vehicles += `${m + 1}) ${vehiclesPresent[m].desc} (parked ${vehiclesPresent[m].location}), LP - ${vehiclesPresent[m].plateNo}.`;
          }
          descArr.push(vehicles);
        }
        break;
      }
      case "interview":{
        const {contact,method,meta:{refusedToSpeak,refusedToProvideInfo,leftAttyLetter}} = logItem;
        let str = `Spoke to ${contact.name} (${method})`;
        let heshe = contact.sex == "O"?"They":contact.sex == "F"?"She":"He";
        if(refusedToSpeak) str += `, refused to be interviewed`;
        if(refusedToProvideInfo) str += `, refused to provide any additional information`;
        if(leftAttyLetter) str += `, accepted letter from attorney`;
        str += ".";
        descArr.push(str);
        break;
      }
      case "upload":{
        const {resource_type,original_filename} = logItem.meta;
        descArr.push(`${Utils.cap(resource_type)} added: ${original_filename}.`);
        break;
      }
      case "note":{
        descArr.push(`Note added: ${logItem.body}.`);
        break;
      }
    }
    return descArr;
  };
  static getInvoice = async (caseId:string) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if(!case_) throw new Utils.AppError(422,'Requested case not found');
    return case_.invoice;
  };
  static sendInvoice = async (caseId:string,{recipient,sentAt}:{recipient:"client"|"vendor",sentAt?:Date}) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if(!case_) throw new Utils.AppError(422,'Requested case not found');
    await case_.populateMe();
    const addressee = recipient == "vendor"?case_.vendor:case_.client;
    console.log("sending invoice to:",addressee.name);
     //send registration notification
    await notify({
      type:"SEND_INVOICE",
      method:Types.IContactMethods.EMAIL,
      audience:[addressee.id],
      data:{
        name:addressee.name.split(" ")[0],
        invoice:case_.invoice.toString()
      }
    });
    case_.invoice.meta.sent = sentAt?new Date(sentAt):new Date();
    await case_.saveMe();
    return case_.invoice;
  };
  static markInvoiceAsPaid = async (caseId:string,{paidAt}:{paidAt?:Date}) => {
    const case_ = await PiMiaModels.Case.findById(caseId);
    if(!case_) throw new Utils.AppError(422,'Requested case not found');
    case_.invoice.meta.paid = paidAt?new Date(paidAt):new Date();
    await case_.saveMe();
    return case_.invoice;
  };

  // 📌 Case Helpers
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
        url:"https://us1.locationiq.com/v1/search/structured?"+queryStr,
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