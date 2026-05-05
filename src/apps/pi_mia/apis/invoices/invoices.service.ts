import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import PiMiaModels from "../../models";
import PiMiaTypes from "../../types";
import { uploadFields } from "@middleware";
import { QueryOptions } from 'mongoose';

const notify = Services.Notifications.createNotification;

const queryOpts:QueryOptions = { returnDocument:"after",runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const {NEW,ACTIVE,ASSIGNED,CLOSED} = PiMiaTypes.IInvoiceStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Invoice} = PiMiaModels;
const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class InvoicesService {
  static createInvoice = async (creator:string,newInvoice:PiMiaTypes.IInvoiceITO) => {
    const invoice = new Invoice({
      creator,
      meta:{},
      ledger:[],
      notes:[],
      hands:[],
      ...newInvoice
    });
    await invoice.saveMe();
    await AppUsage.make(`prf/${creator}`,"createdInvoice",{which:`ssn/${invoice.id}`});
    return {invoice};
  };
  static getInvoiceById = async (creator:string,invoiceId:string) => {
    const invoice = await Invoice.findById(invoiceId);
    if(!invoice) throw new Utils.AppError(422,'Requested invoice not found');
    await invoice.populateMe();
    await AppUsage.make(`prf/${creator}`,"fetchInvoice",{which:`ssn/${invoice.id}`});
    return {invoice};
  };
  static updateInvoice = async (
    creator:string,
    invoiceId:string,
    {...updates}:Partial<PiMiaTypes.IInvoice>) => {
    const invoice = await Invoice.findByIdAndUpdate(invoiceId,{$set:updates},queryOpts);
    if (!invoice) throw new Utils.AppError(422,'Requested invoice not found');
    await invoice.populateMe();
    await AppUsage.make(`prf/${creator}`,"updatedInvoice",{which:`ssn/${invoice.id}`});
    return {invoice};
  };
  static deleteInvoice = async (creator:string,invoiceId:string) => {
    const invoice = await Invoice.findByIdAndDelete(invoiceId);
    if (!invoice) throw new Utils.AppError(422,'Requested invoice not found');
    await AppUsage.make(`prf/${creator}`,"deletedInvoice",{which:`ssn/${invoice.id}`});
    return {ok:true};
  };
  static updateInvoiceStatus = async (
    invoiceId:string,
    status:PiMiaTypes.IInvoiceStatuses) => {
    const invoice = await Invoice.findByIdAndUpdate(invoiceId,{$set:{status}},queryOpts);
    if (!invoice) throw new Utils.AppError(422,'Requested invoice not found');
    await invoice.populateMe();
    return {invoice};
  };
  static sendInvoice = async (invoiceId:string,{recipient,sentAt}:{recipient:"client"|"vendor",sentAt?:Date}) => {
    const invoice = await PiMiaModels.Invoice.findById(invoiceId);
    if(!invoice) throw new Utils.AppError(422,'Requested invoice not found');
    const addressee = invoice.addressee;
    await invoice.populateMe();
    console.log("sending invoice to:",addressee.name);
     //send registration notification
    await notify({
      type:"SEND_INVOICE",
      method:Types.IContactMethods.EMAIL,
      audience:[addressee.id as any],
      data:{
        name:addressee.name.split(" ")[0],
        invoice:invoice.toString()
      }
    });
    invoice.meta.sent = sentAt?new Date(sentAt):new Date();
    await invoice.saveMe();
    return invoice;
  };
  static markInvoiceAsPaid = async (invoiceId:string,{paidAt}:{paidAt?:Date}) => {
    const invoice = await PiMiaModels.Invoice.findById(invoiceId);
    if(!invoice) throw new Utils.AppError(422,'Requested invoice not found');
    invoice.meta.paid = paidAt?new Date(paidAt):new Date();
    await invoice.saveMe();
    return invoice;
  };
  static generateInvoice = ({
    id:invoiceId,
    reqNo:invoiceNo,
    objective:objective_,
    subjects,
    attempts,
    admin,
  }:PiMiaTypes.ICase):PiMiaTypes.IInvoice => {
    const primary = subjects.filter(o => o.meta.type == "primary")[0];
    const objective = objective_ == "full"?"Full Investigation":"Other";
    const title = `JOB: ${Utils.capWSpaces(primary.name)} - ${objective}`;
    const invoice:PiMiaTypes.IInvoice = {title,invoiceId,invoiceNo} as any;
    const {info:{rateAmt,rateUnit,mileageRate}} = admin;
    const items:any[] = [];
    for(let i = 0,j = attempts.length;i<j;i++){
      const attempt = attempts[i];
      let descArr = [`${new Date(attempt.start).toDateString()} - Reviewed assignment.`];
      for(let k = 0,l = attempt.log.length;k<l;k++){
        const desc = this.generateInvoiceDesc(subjects,attempt.log[k]);
        descArr.push(...desc);
      }
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
    subjects:PiMiaTypes.ICaseSubject[],
    logItem:PiMiaTypes.ICaseAttempt["log"][0]
  ) => {
    const descArr:string[] = [];
    switch(logItem.type){
      case "stop":{
        const {addrIdx,subjectIdx,addr,loc,meta:{vehiclesPresent,leftAttyLetter,verification}} = logItem;
        const attemptAddr = subjects[subjectIdx].contact.addrs[addrIdx];
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
        const {contact:interviewee,method,meta:{refusedToSpeak,refusedToProvideInfo,leftAttyLetter}} = logItem;
        let str = `Spoke to ${interviewee.name} (${method})`;
        let heshe = interviewee.info.sex == "O"?"They":interviewee.info.sex == "F"?"She":"He";
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
}
export default InvoicesService;