type Entity = {
  id:any;
  createdOn:Date;
  updatedOn:Date;
  status:string;
  desc?:string;
  info?:MiscInfo;
  meta?:any;
};
type DocEntity = Entity & Document_ & {
  creator:ObjectId_|any;
};
type Collection<T,K extends string = ""> = {
  new:Partial<T>;
  items:{[k in K]:T[]};
  selected:Nullable<{id:string;i:number;item:T}>;
};
type DeletedEntity = {id:string;ok:AnyBoolean;};