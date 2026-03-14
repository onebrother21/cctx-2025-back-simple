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
  static createVenues = async (creator:string,newDegenVenues:Partial<DegenTypes.IDegenVenue>[]) => {
    const venues:DegenTypes.IDegenVenue[] = [];
    for(let i = 0,l = newDegenVenues.length;i<l;i++){
      const n = {creator,...newDegenVenues[i]};
      const venue = new DegenVenue(n);
      await venue.saveMe();
      venues.push(venue);
    }
    return {venues};
  };
  static createVenue = async (creator:string,{addr,...newDegenVenue}:Partial<DegenTypes.IDegenVenue>) => {
    const venue = new DegenVenue({creator,info:{},meta:{timesPlayed:0,tags:[]},...newDegenVenue});
    venue.addr = {...addr,loc:{type:"Point",coordinates:addr.loc}} as any;
    await venue.saveMe();
    return {venue};
  };
  static getVenueById = async (venueId:string) => {
    const venue = await DegenVenue.findById(venueId);
    if(!venue) throw new Utils.AppError(422,'Requested venue not found');
    await venue.populateMe();
    return {venue};
  };
  static updateVenue = async (venueId:string,upd:Partial<DegenTypes.IDegenVenue>) => {
    if(upd.addr) upd.addr = {...upd.addr,loc:{type:"Point",coordinates:upd.addr.loc}} as any;
    const venue = await DegenVenue.findByIdAndUpdate(venueId,{$set:upd},queryOpts);
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    await venue.populateMe();
    return {venue};
  };
  static deleteVenue = async (venueId:string) => {
    const venue = await DegenVenue.findByIdAndDelete(venueId);
    if (!venue) throw new Utils.AppError(422,'Requested venue not found');
    return {ok:true};
  };
  static updateVenueStatus = async (
    admin:string,
    venueId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const venue = await DegenVenue.findById(venueId);
    if(!venue) throw new Utils.AppError(422,'Requested venue not found');
    await venue.saveMe();
    return {venue};
  };
}
export default DegenVenuesService;