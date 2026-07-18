import * as PROFILES from "./profiles.types";

export type IDegenTag = {
  creator:PROFILES.IDegenPlayer;
  createdOn:Date;
  text:string
};
export enum IDegenVenueStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  ENABLED = "enabled",
  LOCKED = "locked",
  DELETED = "deleted"
}
export type IDegenVenueType = {
  type:"home"|"bar"|"poker"|"other";
  meta:{timesPlayed:number;tags:IDegenTag[];};
  name:string;
  addr:AddressResult;
  phn?:PhoneNumber;
  host?:string;
  org?:string;
  img?:Pick<UploadResponse,"type"> & {
    id:string;
    url:string;
    time:Date;
    meta:Omit<UploadResponse,"type">;
  };
  desc?:string;
  publishedOn:Date;
};
export type IDegenVenueObj = DocEntityObj<IDegenVenueType,IDegenVenueStatuses,PROFILES.IDegenPlayer>;
export type IDegenVenueITO = Partial<IDegenVenueObj>;
export type IDegenVenuePTO = Partial<Omit<IDegenVenueObj,"img"> & {img:string}>;
export type IDegenVenueOTO = Partial<Omit<IDegenVenueObj,"img"> & {img:string}>;
export type IDegenVenue = DocEntity<IDegenVenueObj,IDegenVenueOTO,IDegenVenuePTO>;

export type IDegenVenueQueryKeys = {
  strings:
  |"creatorId"|"creator.name"|"creator.displayName"
  |"status"|"desc"|"name"|"org"|"host"
  |"phn"|"addr.info"|"meta.tags.text";
  numbers:"meta.timesPlayed";
  dates:"created_on"|"published";
  geoNear:"addr.loc";
};
export type IDegenVenueQuery = StrongQuery<IDegenVenueQueryKeys>;