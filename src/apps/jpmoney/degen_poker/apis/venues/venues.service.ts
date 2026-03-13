import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const venueStats = DegenTypes.IDegenVenueStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {DegenVenue} = DegenModels;
const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class DegenVenuesService {
  static lookupVenueAddress = async (o:string) => {
    if(!o) throw new Utils.AppError(422,'invalid address params');
    const results = await Utils.lookupAddresses([o]);
    return {results};
  };
  static lookupVenueAddress2 = async (o:AddressObj) => {
    if(!(o.city && o.state && o.country) || !(o.info || o.streetAddr)) throw new Utils.AppError(422,'invalid address params');
    const results = await Utils.lookupAddresses([o]);
    Utils.info({results})
    return {results};
  };
  // 📌 DegenVenue CRUD Ops
  static createDegenVenues = async (creator:string,newDegenVenues:Partial<DegenTypes.IDegenVenue>[]) => {
    const venues:DegenTypes.IDegenVenue[] = [];
    for(let i = 0,l = newDegenVenues.length;i<l;i++){
      const n = {creator,...newDegenVenues[i]};
      const venue = new DegenVenue(n);
      await venue.saveMe();
      venues.push(venue);
    }
    return {venues};
  };
  static createDegenVenue = async (creator:string,{addr,...newDegenVenue}:Partial<DegenTypes.IDegenVenue>) => {
    const venue = new DegenVenue({creator,info:{},meta:{timesPlayed:0,tags:[]},...newDegenVenue});
    venue.addr = {...addr,loc:{type:"Point",coordinates:addr.loc}} as any;
    await venue.saveMe();
    return {venue};
  };
  static getDegenVenueById = async (venueId:string) => {
    const venue = await DegenVenue.findById(venueId);
    if(!venue) throw new Utils.AppError(422,'Requested venue not found');
    await venue.populateMe();
    return {venue};
  };
  static updateDegenVenue = async (venueId:string,upd:Partial<DegenTypes.IDegenVenue>) => {
    if(upd.addr) upd.addr = {...upd.addr,loc:{type:"Point",coordinates:upd.addr.loc}} as any;
    const venue = await DegenVenue.findByIdAndUpdate(venueId,{$set:upd},queryOpts);
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    await venue.populateMe();
    return {venue};
  };
  static deleteDegenVenue = async (venueId:string) => {
    const venue = await DegenVenue.findByIdAndDelete(venueId);
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    return {ok:true};
  };


  // DegenVenue Updates
  static updateDegenVenueStatus = async (
    admin:string,
    venueId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const venue = await DegenVenue.findById(venueId);
    if(!venue) throw new Utils.AppError(422,'Requested venue not found');
    await venue.saveMe();
    return {venue};
  };
  /*
  static addFilesToDegenVenue = async (venueId:string,files:DegenTypes.IDegenVenue["files"]) => {
    const venue = await DegenVenue.findByIdAndUpdate(venueId,
      { $push: { files }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    await venue.populateMe();
    return {venue};
  };
  static removeFileFromDegenVenue = async (venueId:string,fileIdx:number) => {
    const venue = await DegenVenue.findById(venueId);
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    venue.files = venue.files.filter((o,i) => i !== fileIdx);
    await venue.saveMe();
    return {venue};
  };
  */
  // 📌 DegenVenue Resolution & Invoicing
  static finalizeDegenVenue = async (venueId:string,{status,reason,resolution}:{
    status:typeof venueStats,
    resolution:string,//Partial<Types.IDegenVenueDetails>,
    reason:string}) => {
    const venue = await DegenVenue.findById(venueId);
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    
    const update = {
      status,
      action:`status changed to '${status}'`,
      user:"sys-admn",
      time:new Date()
    };
    //venue.invoice = DegenVenuesService.generateInvoice(venue);
    await venue.saveMe();
    return {venue};
  };
  static closeDegenVenue = async (venueId:string) => {
    const venue = await DegenVenue.findById(venueId);
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    //if (venue.status == CLOSED || !venue.invoice.meta.paid) throw new Utils.AppError(422,'Requested venue cannot be closed');
    
    const update = {
      //status:approvalStats.CLOSED,
      //action:`status changed to '${profileStats.CLOSED}'`,
      user:"sys-admn",
      time:new Date()
    };
    await venue.saveMe();
    return {venue};
  };
}