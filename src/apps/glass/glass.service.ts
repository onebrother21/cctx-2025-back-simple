import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';
import { QueryOptions } from 'mongoose';
import { oHas } from "../../utils/common-utils";
//import { IGlassUser } from "./user.types";

const {LocationHelpers} = Services;

const {EMAIL,SMS,PUSH} = Types.IContactMethods;
const notify = Services.Notifications.createNotification;

const queryOpts:QueryOptions = { returnDocument:"after",runValidators: true,context:'query' };

const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

type StrategyParams = {
  seedList:string,
  maxInc:number,
  minTimes:number,
  maxTimes:number,
  algos:string,
  directions:string,
  draws?:number,
};
type StrategySimParams = StrategyParams & {
  type:"gap-fill"|"pos-shift"|"moving-w";
  reseedFromWinners?:boolean;
  costPerPlay:number;
}
type StrategyItem = {name:string,play:string,dupe:boolean};
type StrategyResult = StrategyItem & {score:number,prize:number};
type StrategyStatNames = 
"topPrize"|"topScore"|"avgScore"|"actualPlays"|"totalCost"|"totalPrize"|"myProfit"|"myReturn";
type StrategyStats = Record<StrategyStatNames,number>;
type StrategyAnalysis = {winList:string,plays:StrategyResult[];} & StrategyStats;
class WeightedSelector {
  cdf:number[] = [];
  totalWeight = 0;
  constructor(private items:{v:number,w:number}[] = []) {
    let runningSum = 0;
    for (const item of this.items) {
      runningSum += item.w;
      this.cdf.push(runningSum);
    }
    this.totalWeight = runningSum;
  }

  pick() {
    const target = Math.random() * this.totalWeight;
    let low = 0;
    let high = this.cdf.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (target < this.cdf[mid]) high = mid;
      else low = mid + 1;
    }
    return this.items[low].v;
  }
}

export class GlassNumbersService {
  static calcComboProbability = async (data:{"ncr-n":number,"ncr-r":number,"ncr-m":string}) => {
    const N = Number(data["ncr-n"]);
    const R = Number(data["ncr-r"]);
    const M_ = data["ncr-m"].trim();
    const M = M_.length == 1?[Number(M_)]:M_.split(" ").map(n => Number(n));
    const numbers = new Array(N).fill(0).map((v,i) => i + 1);

    function getCombinations(arr:number[],size:number) {
      if (size === 1) return arr.map(item => [item]);
      const result:number[][] = [];
      arr.forEach((item, index) => {
        const remainingElements = arr.slice(index + 1);
        const subCombinations = getCombinations(remainingElements, size - 1);
        subCombinations.forEach(sub => result.push([item, ...sub]));
      });
      return result;
    }
    const allCombos = getCombinations(numbers,R);
    const matchingCombos = allCombos.filter(combo => {
      let match = true;
      for(let i =0;i<M.length;i++) if(!combo.includes(M[i])){match = false;break;}
      return match;
    });
    const P = (100 * matchingCombos.length/allCombos.length).toFixed(2);
    const newdata = {
      totalCombos:allCombos.length,
      matchingCombos:matchingCombos.length,
      P
    };
    Utils.log("ncr-newdata",{N,R,M},newdata);
    return newdata;
  }
  static getNewDraw = () => {
    try{
      let a:number[] = [],b:number[] = [];
      for(let i = 0;i<24;i++) a.push(i + 1);
      for(let i = 0;i<12;i++){
        const j = Math.floor(Math.random() * a.length);
        b.push(a[j]);
        a = a.filter((v,i) => i !== j);
      }
      const newDraw = b.sort((a,b) => a - b).join(" ");
      return newDraw;
    }
    catch(e){throw e;}
  };
  static getNumberArray = (a:string) => a.split(/[\s\,]/).map(n => Number(n));
  static getPrize = (n:number) => {
    switch(true){
      case [0,12].includes(n):return 250000;
      case [1,11].includes(n):return 500;
      case [2,10].includes(n):return 50;
      case [3,9].includes(n):return 10;
      case [4,8].includes(n):return 2;
      default:return 0;

    }
  };
  static runMovingWeightsStrategy = async (data:StrategyParams) => {
    try{
      const {seedList,maxTimes = 10} = data;
      const numArr = seedList.split(/[\s]/).map(n => Number(n));
      let a = new Array(24).fill(0);
      const a_ = a.map((v,i) => numArr.includes(i+1)?1:0);
      const results:StrategyItem[] = [{name:"orig-numbers",play:seedList,dupe:false}];
      
      const weighted = new WeightedSelector(a_.map(v => ({v,w:v?1/576:23/576})));
      Utils.info("runMovingWeightsStrategy",weighted);
      for(let n = 0;n<maxTimes;n++){
        const newArr = [];
        for(let i = 0;i<12;i++) newArr.push(weighted.pick());
        results.push({
          name:`right-shift@n=${n+1}`,
          play:newArr.join(" "),
          dupe:false,
        });
      }
      return {results};
    }
    catch(e){throw e;}
  };
  static runPositionShiftStrategy = async (data:StrategyParams) => {
    try{
      const {seedList,maxTimes = 10} = data;
      const numArr = seedList.split(/[\s]/).map(n => Number(n));
      let a = new Array(24).fill(0);
      const a_ = a.map((v,i) => numArr.includes(i+1)?1:0);
      const results:StrategyItem[] = [{name:"orig-numbers",play:seedList,dupe:false}];
      const results_unique:string[] = [];
      const shiftArr = (s:number[],i:number,n:number) => {
        const myAr = [];
        const p = s.slice(i,n);
        i == 0?s.unshift(...p):s.push();
        return s;
      };
      for(const start of [0,a_.length - 1]){
        for(let n = 0;n<maxTimes;n++){
          const result = shiftArr(a_,start,n+1);
          results.push({
            name:`right-shift@n=${n+1}`,
            play:result.join(" "),
            dupe:false,
          });
        }
      }
      return {results};
    }
    catch(e){throw e;}
  };
  static runGapFillStrategy = async (data:StrategyParams) => {
    try{
      const allAlgos = ["add","sub","add-then-sub","sub-then-add"];
      const allDirections = ["ltr","rtl"];
      const algos = data.algos == "run-all"?allAlgos:data.algos.split(",");
      const directions = data.directions == "run-all"?allDirections:data.directions.split(",");
      const minTimes = Number(data.minTimes);
      const maxTimes = Number(data.maxTimes);
      const maxInc = Number(data.maxInc);
      const {seedList} = data;
      const numArr = this.getNumberArray(seedList);
      const lastIdx = numArr.length - 1;
      const results:StrategyItem[] = [{name:"orig-numbers",play:seedList,dupe:false}];
      const results_unique:string[] = [];

      for(const algo of algos){
        for(const direction of directions){
          for(let n = 0;n<maxInc;n++){
            for(let t=minTimes - 1;t<maxTimes;t++){
              const newArr:number[] = [];
              let k = -1;
              for(let i=0,l = numArr.length;i<l;i++){
                const isGap = (a:number,b:number) => a && b && Math.abs(a-b) > n + 1;
                const doInc = (a:number,b:number,posOrNeg:number) => isGap(a,b)?
                {val:a + posOrNeg * (n + 1),inc:true}:
                {val:a,inc:false};
                const loc = direction == 'ltr'?i:lastIdx - i;
                const lastAdded = newArr[newArr.length - 1];
                let curr = numArr[loc],prev = numArr[loc-1],next = numArr[loc+1];
                let o:{val:number,inc:boolean}|null = null;

                if(k < t){
                  switch(algo){
                    case "add":o = doInc(curr,next || 24,1);break;
                    case "sub":o = doInc(curr,prev || 1,-1);break;
                    case "add-then-sub":{
                      if(k%2) o = doInc(curr,next || 24,1);
                      else o = doInc(curr,prev || 1,-1);
                      break;
                    }
                    case "sub-then-add":{
                      if(!(k%2)) o = doInc(curr,next || 24,1);
                      else o = doInc(curr,prev || 1,-1);
                      break;
                    }
                    default:break;
                  }
                  o && o.inc?k++:null;
                }
                const val = !o?curr:o.val !== lastAdded?o.val:curr;
                //Utils.log("tranform",{curr,next,gap:isGap(curr,next),...o});
                newArr.push(val);
              }
              const result_ = direction == 'ltr'?newArr:newArr.reverse();
              const result = result_.join(" ");
              const dupe = results_unique.includes(result);
              if(!dupe) results_unique.push(result);
              results.push({
                name:`${algo}-${direction.toUpperCase()}@n=${n+1}&t=${t+1}`,
                play:result,
                dupe:dupe,
              });
            }
          }
        }
      }
      return {results};
    }
    catch(e){throw e;}
  };
  static checkError = async (winList:string,myNumbers:StrategyItem[],opts:{costPerPlay:number}) => {
    try{
      const {costPerPlay} = opts;
      const winners = this.getNumberArray(winList);
      let plays:StrategyResult[] = [],topPrize = 0,topScore = 0;
      myNumbers.forEach(n => {
        if(n.name !== "orig-numbers"){
          const play = this.getNumberArray(n.play);
          const valid = play.length == winners.length;
          if(valid){
            let correct = 0;
            for(let j = 0;j<play.length;j++) if(winners.includes(play[j])) correct++;
            const score = Math.round(100 * correct/play.length);
            const prize = this.getPrize(correct);
            plays.push({...n,score,prize});
            !topPrize || prize > topPrize?topPrize = prize:null;
            !topScore || score > topScore?topScore = score:null;
          }
        }
      });
      const actualPlays = plays.filter(n => !n.dupe);
      const avgScore = actualPlays.reduce((o,p) => o + p.score,0)/actualPlays.length;
      const totalCost = actualPlays.length * costPerPlay;
      const totalPrize = actualPlays.reduce((o,p) => o + p.prize,0);
      const myProfit = totalPrize - totalCost;
      const myReturn = 100 * myProfit/totalCost;
      const ec:StrategyAnalysis = {
        winList,plays,topPrize,topScore,
        actualPlays:actualPlays.length,avgScore,
        totalCost,totalPrize,myProfit,myReturn
      };
      return ec;
    }
    catch(e){throw e;}
  };
  static runStrategySim = async (data:StrategySimParams) => {
    const arr:StrategyStats[] = [];
    const draws = Number(data.draws) || 100;
    const costPerPlay = Number(data.costPerPlay) || 2;
    const {type,reseedFromWinners} = data;
    
    let seedList = this.getNewDraw();
    for(let i=0;i<draws;i++){
      const {results} = 
      type == "gap-fill"?await this.runGapFillStrategy({...data,seedList}):
      type == "pos-shift"?await this.runPositionShiftStrategy({...data,seedList}):
      await this.runMovingWeightsStrategy({...data,seedList});

      const newDraw = this.getNewDraw();
      const ec = await this.checkError(newDraw,results,{costPerPlay});
      arr.push(ec);
      seedList = reseedFromWinners?ec.winList:this.getNewDraw();
    }
    const totalPlays = arr.reduce((o,p) => o + p.actualPlays,0);
    const totalCost = arr.reduce((o,p) => o + p.totalCost,0);
    const totalPrize = arr.reduce((o,p) => o + p.totalPrize,0);
    const totalProfit = arr.reduce((o,p) => o + p.myProfit,0);
    const avgProfitPerPlay = arr.reduce((o,p) => o + p.myProfit,0)/totalPlays;
    const avgScorePerDraw = arr.reduce((o,p) => o + p.avgScore,0)/draws;
    const totalReturn = 100 * totalProfit/totalCost;
    return {
      totalDraws:draws,
      totalPlays,
      totalCost,
      totalPrize,
      totalProfit,
      totalReturn,
      playsPerDraw:totalPlays/draws,
      avgProfitPerPlay,
      avgScorePerDraw
    };
  };
}
export default GlassNumbersService;
/*
  case "add-then-sub":{
    printvars(curr,prev,next,k%2,isGap(curr,next || 24),isGap(curr,prev || 1));
    if((k%2) == 1){
      if(isGap(curr,next || 24)){val += increment;k++;}
    }
    else {if(isGap(curr,prev || 1)){val -= increment;k++;}}
    break;
  }
  case "sub-then-add":{
    if((k%2) == 0){if(isGap(curr,next || 24)){val += increment;k++;}}
    else{if(isGap(curr,prev || 1)){val -= increment;k++;}}
    break;
  }
    */