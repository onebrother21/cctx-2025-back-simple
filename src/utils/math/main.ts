export const {
  pow,sqrt,sin,cos,tan,abs,PI:π,exp,log:ln,min,max,
  random,floor,ceil,round,asin,acos,atan} = Math;
export const sign = (x:number) => typeof x === "number"?x?x<0?-1:1:x === x?0:NaN:NaN;
export const sq = (x:number) => pow(x,2);
export const cube = (x:number) => pow(x,3);
export const neg = (x:number) => -x;
export const inv = (x:number) => 1/x;
export const rt = (x:number,p:number) => pow(x,1/p);
export const eq = (x:number,y:number,p:number = 2) => abs(x - y) <= 1/pow(10,p);
export const sum = (...N:number[]) => {
  let s:number = 0;
  for(let i=0,l = N.length;i<l;i++) s+=N[i];
  return s;};
export const hyp = (a:number,b:number) => sqrt(sq(a) + sq(b));
export const avg = (...N:number[]) => sum(...N)/N.length;
export const slope = (x1:number,x2:number,y1:number,y2:number) => (y2 - y1)/(x2 - x1);
export const filter = (n:number,min:number,max:number) => n < min ? min :n > max ? max : n;
export const scale = (n:number,s:number) => n * (1 + s);
export const rand = (n:number) => floor(random() * n);
export const randnum = (n:number,m:number) => floor(random() * (m - n)) + n;
export const randPct = (n:number) => rand(n)/n;
export const pctDiff = (m:number,n:number) => (n - m)/m;
export const within = (e:number,p:number = 0) => abs(e) <= p;
export const between = (n:number,b:[number,number],inc?:"L"|"R"|"A"|"B"|true) => {
  //A, B, true includes both bounds
  return !inc?n > b[0] && n < b[1]:
  inc == "L"?n >= b[0] && n < b[1]:
  inc == "R"?n > b[0] && n <= b[1]:
  n >= b[0] && n <= b[1];};
export const fix = (n:number,p?:number) => Number(n.toFixed(p||0));
export const greeks = "Α,α,Β,β,Γ,γ,Δ,δ,Ε,ε,Ζ,ζ,Η,η,Θ,θ,Ι,ι,Κ,κ,Λ,λ,Μ,μ,Ν,ν"+
"Ξ,ξ,Ο,ο,Π,π,Ρ,ρ,Σ,σ/ς,Τ,τ,Υ,υ,Φ,φ,Χ,χ,Ψ,ψ,Ω,ω";
export const ords = ["st","nd","rd","th"];
export type StatObj = Partial<{
  sum:number;
  ssq:number;
  mean:number;
  std:number;
  min:number;
  max:number;
  first:number;
  last:number;}>;
export const initialStats:StatObj = {
  sum:0,
  ssq:0,
  mean:0,
  std:0,
  min:0,
  max:0,
  first:0,
  last:0};
export const stats = (x:number,n:number,o:StatObj) => {
  n == 1?o.first = x:null;
  o.last = x;
  o.sum += x;
  o.ssq += sq(x);
  o.mean = o.sum/n;
  o.std = n > 1?sqrt((o.ssq - sq(o.sum)/n)/(n-1)):0;
  o.min = min(x,o.min);
  o.max = max(x,o.max);
  return o;};
export const noop = () => {};
export type SlopeInputs = {xmin:number;xmax:number;ymin:number;ymax:number;};
export type TimeInMSObject = Partial<Record<"milli"|"secs"|"mins"|"hrs"|"days"|"mos"|"yrs"|"yrs-leap",number>>;
export const timeInMS = (o:TimeInMSObject) => {
  let time = 0;
  for(const k in o) switch(k){
    case "milli":time += o[k];break;
    case "secs":time += o[k] * 1000;break;
    case "mins":time += o[k] * 1000 * 60;break;
    case "hrs":time += o[k] * 1000 * 60 * 60;break;
    case "days":time += o[k] * 1000 * 60 * 60 * 24;break;
    case "mos":time += o[k] * 1000 * 60 * 60 * 24 * 30;break;
    case "yrs":time += o[k] * 1000 * 60 * 60 * 24 * 365;break;
    case "yrs-leap":time += o[k] * 1000 * 60 * 60 * 24 * 365.25;break;
  }
  return time;
};