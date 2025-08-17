
export enum IFinancialLineItemStatuses {
  NEW = "new",
  ACTIVE = "active",
  ASSIGNED = "assigned",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  PENDING = "pending",
  CLOSED = "closed",
  REOPENED = "reopened",
  CANCELLED = "cancelled",
  PROCESSED = "processing",
  IN_PROGRESS = "in-progress"
}
export type IFinancialLineItemType = DocEntity<IFinancialLineItemStatuses> & {
  type:"expense"|"revenue"|"asset"|"liability"|"debt"|"budget";
  title:string;
  amount: number;
  category: string;
  period: string; // e.g., 'monthly', 'quarterly'
  notes: string[];
  meta:Record<"submittedOn"|"dueOn"|"billedOn"|"sentOn"|"paidOn",Date>;
  reason:string;
};
export interface IFinancialLineItemMethods {
  saveMe(status?:IFinancialLineItemStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  json():Partial<IFinancialLineItem>;
}
export interface IFinancialLineItem extends IFinancialLineItemType,IFinancialLineItemMethods {}