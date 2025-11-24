
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
export type IFinancialLineItemType = DocEntity & {
  type:"expense"|"revenue"|"asset"|"liability"|"debt"|"budget";
  title:string;
  amount: number;
  category: string;
  period: string; // e.g., 'monthly', 'quarterly'
  notes:IFinancialLineItemType["log"];
  meta:Record<"submittedOn"|"dueOn"|"billedOn"|"sentOn"|"paidOn",Date>;
  reason:string;
};
export interface IFinancialLineItemMethods {
  saveMe(o?:IFinancialLineItem["log"][0]):Promise<void>;
  populateMe():Promise<void>;
  json():Partial<IFinancialLineItem>;
  preview():Partial<IFinancialLineItem>;
};
export interface IFinancialLineItem extends IFinancialLineItemType,IFinancialLineItemMethods {}