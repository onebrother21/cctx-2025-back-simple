type Status<K extends string> = {name:K;time:string|Date;info?:MiscInfo;};
type LocaleDateOpts = Record<"weekday"|"month"|"day"|"year"|"hour"|"minute"|"second",string> & {hour12?:boolean;};
type HrsOfOperation = `${number}${"am"|"pm"} - ${number}${"am"|"pm"}`;
type PhoneNumber = `+${number}-${number}-${number}-${number}`;
type ZipCode = `${number}`;
type AddressObj = Partial<Record<"streetAddr"|"city"|"state"|"postal"|"country"|"info",string> & {loc:{type:"Point",coordinates:[number,number]}}>;
type MiscModelRef = {id:string;ref:string;};
type LocationObj = {loc:[number,number]};
type Attachment = {
  originDate:string|Date;
  originLoc:string|Date;
  originName:string;
  name:string;
  mimeType:|"pdf"|"doc"|"docx"|"png"|"jpg"|"jpeg"|"aud"|"wav"|"mov4";
  size:number;
  res:string;
  location:string;
};
type UploadResponse = {
  id:string,
  type:"upload",
  asset_folder:string,
  original_filename:string,
  original_date:Date,
  location:string,
  description:string,
  format:string,
  resource_type:string,
  bytes:number,
  secure_url:string,
  public_id:string,
  created_at:Date|string,
  time:Date,
};