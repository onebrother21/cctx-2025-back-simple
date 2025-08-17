import {π} from "./main";
import {AppError} from "../common-models";
import {is} from "../common-utils"

export type Unit =
  "in"|"m"|"km"|"mi"|"ft"|"mm"|
  "lb"|"kg"|
  "lbft"|"Nm"|"lbin"|"ozin"|
  "N"|"kg/m^3"|
  "mph"|"m/s"|"kph"|"rpm"|"deg/s"|"rad/s"|
  "m/s^2"|"rad/s^2"|
  "deg"|"rad"|
  "F"|"C"|"K"|
  "inHg"|"hPa"|
  "in^2"|"m^2"|"ft^2"|
  "in^3"|"ft^3"|"m^3"|
  "h"|"s"|"ms"|
  "hp"|"W"|"kW"|"kWh"|"J"|"V"|"Ah"|"A"|
  "Pas"|"m^2/s"|
  "Wh/mi"|"mpg"|"mpge"|"gal";
export type ConversionNames =
  "in-m"|"km-m"|"mi-m"|"ft-m"|"mm-m"|
  "lb-kg"|"lbft-Nm"|"lbin-Nm"|"ozin-Nm"|
  "mph-m/s"|"kph-m/s"|"mph-kph"|"deg-rad"|"deg/s-rad/s"|
  "F-C"|"F-K"|"C-K"|
  "inHg-hPa"|"in^2-m^2"|"ft^2-m^2"|"in^3-m^3"|"ft^3-m^3"|
  "h-s"|"ms-s"|
  "hp-W"|"kW-W"|"kWh-J"|
  "rpm-rad/s"|"kWh-gal";
export type Converter = (q:number) => number;
export type Conversions = {[k in ConversionNames]:[number,number]|[Converter,Converter]};
export const conversions:Conversions = {
  "in-m":[0.0254,39.3701],
  "km-m":[1000,0.001],
  "mi-m":[1609.344,0.00062137],
  "ft-m":[0.3048,3.28084],
  "mm-m":[0.001,1000],
  "lb-kg":[0.453592,2.20462],
  "lbft-Nm":[1.35582,0.737562],
  "lbin-Nm":[0.112985,8.850746],
  "ozin-Nm":[0.0070616,141.611932],
  "kph-m/s":[0.277778,3.6],
  "mph-m/s":[0.44704,2.23694],
  "mph-kph":[1.60934,.62137],
  "deg-rad":[0.0174533,57.2958],
  "deg/s-rad/s":[0.0174533,57.2958],
  "F-C":[q => (q - 32) * 5/9 ,q => (q * 9/5) + 32],
  "F-K":[q => (q - 32) * 5/9 + 273.15,q => (q - 273.15) * 9/5 + 32],
  "C-K":[q => q + 273.15,q => q - 273.15],
  "inHg-hPa":[33.86389,0.02953],
  "in^2-m^2":[0.00064516,1550],
  "ft^2-m^2":[0.092903,10.7639],
  "in^3-m^3":[1.63871e-5,61023.87816],
  "ft^3-m^3":[0.0283168,35.3146],
  "h-s":[3600,0.000277778],
  "ms-s":[0.001,1000],
  "hp-W":[745.7,0.00134102],
  "kW-W":[1000,0.001],
  "kWh-J":[3600000,2.77778e-7],
  "rpm-rad/s":[π/30,30/π],
  "kWh-gal":[0.029931063,33.410107],
};
export const convert = (q:number,u:[Unit,Unit]) => {
  if(isNaN(q)) throw new AppError(`value is NaN`);
  if(!is(q)) throw new AppError(`value is undefined`);
  if(u[0] == u[1]) return q;
  const a = conversions[u.join("-") as ConversionNames];
  const b = conversions[u.reverse().join("-") as ConversionNames];
  if(!(a||b)) throw new AppError(`conversion ${a},value ${q} failed`);
  const c = a?a[0]:b[1];
  return typeof c == "function"?c(q):q * c;
};