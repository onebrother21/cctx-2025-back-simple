export enum IBusinessVarsStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
}
export type IBusinessVarsType = {
  name:string;
  data:string|Record<string,any>;
  meta:{lastUse:Date;};
};
export type IBusinessVarsObj = DocEntityObj<IBusinessVarsType,IBusinessVarsStatuses>;
export type IBusinessVarsJson = Omit<IBusinessVarsObj,"data"> & IBusinessVarsObj["data"];
export type IBusinessVars = DocEntity<IBusinessVarsObj,IBusinessVarsJson>;

export type IBusinessVarsQueryKeys = {
  strings:|"name"|"status";
  dates:|"created_on"|"last_use";
};
export type IBusinessVarsQuery = StrongQuery<IBusinessVarsQueryKeys>;