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
type ImageObj = Pick<UploadResponse,"type"> & {
  id:string;
  url:string;
  time:Date;
  meta:Omit<UploadResponse,"type">;
};
type SocialMediaObj = {platform:string,handle:string};

type ScriptModel = {
  name:string;
  src:string;
  async?:boolean;
  loaded?:boolean;
};
type AppRoute = {url:string;} & Partial<Record<"query"|"params"|"data",any>>;
type AppNavItem = Partial<{
  type:string;
  label:string;
  url:string;
  text:string;
  img:string;
  icon:string;
  iconColor:string;
  category:string;
  classes:string;
  children:AppNavItem[];
  active:boolean;
  disabled:boolean;
  action:string;
  actionIcon:string;
}>;
type TimelineItem = {
  isInverted:boolean,
  badgeColor:string,
  iconClass?:string,
  iconImg?:string,
  badgeText:string,
  body:string,
  timeText?:string|Date,
};
type TableInfo = Record<string,{
  data:any;
  type:"text"|"img"|"obj"|"date"|"date-time"|"yesno"|"null"|"undefined"|"arr"|"arr-empty";
  canEdit?:boolean;
  trim?:number;
}>;
type GridInfo = {n:number;icon?:string;label:string};
type DateRange = {from:Date,to:Date};