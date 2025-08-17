import { Unit,convert as c } from "./conversions";
import { ords } from "./main";

export type Quan<K extends Unit> = number|[number,K];
export type Quans<K extends string> = Enum<Quan<Unit>,K>;
export type Quantities<K extends string> = Enum<Quantity,K>;

export const qty = (o:Quan<Unit>) => Array.isArray(o)?o[0]:(o || 0);
export const unit = (o:Quan<Unit>) => (Array.isArray(o)?o[1]:"") as Unit;

export type QuantityType = {
  val:number;
  unit?:Unit;
  defaultUnit?:Unit;
  precision:number;
  isIndex?:boolean;
  isPct?:boolean;
  isCat?:{[x:number]:string;};
  isRatio?:boolean;
  desc?:string;};
export interface Quantity extends QuantityType {}
export class Quantity {
  constructor(v:number,u:Unit,d:Unit,o:QuantityConfig);
  constructor(v:number|Unit,u:Unit,o:QuantityConfig|Unit);
  constructor(v:number|Unit,o:QuantityConfig|Unit);
  constructor(v:QuantityConfig|Unit|number);
  constructor();
  constructor(
    v?:string|number|QuantityConfig,
    u?:string|QuantityConfig,
    d?:string|QuantityConfig,
    o?:QuantityConfig){
    Object.assign(this,initQty,
      !v?null:
      typeof v == "number"?{val:v}:
      typeof v == "string"?{unit:v}:v,
      !u?null:typeof u == "string"?typeof v == "string"?{defaultUnit:u}:{unit:u}:u,
      !d?null:typeof d == "string"?{defaultUnit:d}:d,
      o||null);
    if(this.unit && !this.defaultUnit) this.defaultUnit = this.unit;
    else if(!this.unit && this.defaultUnit) this.unit = this.defaultUnit;
    if(this.unit != this.defaultUnit) this.val = c(this.val,[this.unit,this.defaultUnit]);
  }
  get info(){
    const {
      precision,defaultUnit,unit,
      isIndex,isPct,isRatio,isCat} = this;
    let val = this.val;
    if(unit != defaultUnit) val = c(val,[defaultUnit,unit]);
    switch(true){
      case isIndex:return (val + 1) + ords[val >= 3?3:val];
      case isPct:return (val * 100).toFixed(precision) + "%";
      case !!isCat:return isCat[val];
      case isRatio:return Number.isInteger(val)?val:val.toFixed(2) + " to 1";
      default:return val.toFixed(precision) + (unit?` ${unit}`:"");}}}
export type QuantityConfig = Partial<QuantityType>;
const initQty:QuantityConfig = {val:0,precision:0};