import { httpReq,shortDate } from './core/index.js' ;

export class GlassNumbers {
  initTabs = () => {
    const tabLinks = document.querySelectorAll('.settings-nav-link.numbers-test[data-tab]');
    if(tabLinks.length === 0) return;

    tabLinks.forEach((link,i) => {
      const tabId = link.getAttribute('data-tab');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.setTab(link,i,tabId);
      });
      const currentTab = glassState.get("currentTab") || 0;
      if(currentTab == i) this.setTab(link,i,tabId);
    });
  };
  setTab = (link,i,tabId) => {
    const otherLinks = document.querySelectorAll('.settings-nav-link.numbers-test');
    const tabs = document.querySelectorAll('.settings-tab-content.numbers-test');

    otherLinks.forEach(n =>  n.classList.remove('active'));
    link.classList.add('active');

    tabs.forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById('tab-' + tabId);
    if(targetTab) targetTab.classList.add('active');

    glassState.set("currentTab",i);
  };
  populateStrategyResults = () => {
    const {data,results} = glassState.get("lastStrategyResults") || {};
    const resultsTitle = document.getElementById('strategyResultsTitle');
    const resultsDiv = document.getElementById('strategyResults');
    if(resultsDiv){
      resultsDiv.replaceChildren();
      if(results && results.length) results.forEach(r => {
        if(!r.dupe){
          const resultName = document.createElement("td");
          resultName.innerHTML = r.name;
          const resultNums = document.createElement("td");
          resultNums.innerHTML = r.play;
          const tr = document.createElement("tr");
          tr.appendChild(resultName);
          tr.appendChild(resultNums);
          resultsDiv.appendChild(tr);
        }
      });
    }
  }
  populateStrategySimResults = () => {
    const {data,results} = glassState.get("lastStrategySimResults") || {};
    console.log(data,results);
    const resultsDiv = document.getElementById('strategySimResults');
    if(resultsDiv){
      // resultsDiv.replaceChildren();
      if(results){
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.innerHTML = new Date().toLocaleString();
        tr.appendChild(td);
        Object.keys(results).forEach(k => {
          const td = document.createElement("td");
          switch(k){
            case "totalReturn":td.innerHTML = Number(results[k]).toFixed(0) + "%";break;
            case "avgProfitPerPlay":
            case "avgScorePerDraw":td.innerHTML = Number(results[k]).toFixed(2);break;
            default:td.innerHTML = results[k];break;
          }
          tr.appendChild(td);
        });
        resultsDiv.appendChild(tr);
      }
    }
  }
  populateCalcComboResults = () => {
    const {data,results} = glassState.get("lastCalcComboResults") || {};
    const resultsTitle = document.getElementById('calcComboResultsTitle');
    const resultsDiv = document.getElementById('calcComboResults');
    if(resultsDiv){
      resultsDiv.replaceChildren();
      if(results){
        const {totalCombos,matchingCombos,P} = results;
        const {"ncr-n":n,"ncr-r":r,"ncr-m":m} = data;
        resultsTitle.innerHTML = `${shortDate(new Date())} -> ${n} numbers, pick  ${r},match "${m}"`;
        resultsDiv.innerHTML = `All Combos: ${totalCombos}, Matching Combos: ${matchingCombos}, P(${m}) = ${P}`;
      }
    }
  }
  populateDerivedAlgorithm = () => {
    const {data,results} = glassState.get("lastDerivedAlgo") || {};
    const resultsTitle = document.getElementById('derivedAlgoTitle');
    const resultsDiv = document.getElementById('derivedAlgo');
    if(resultsDiv){
      resultsDiv.replaceChildren();
      if(results){
        const code = document.createElement('code');
        Object.keys(results).forEach(k => code.innerHTML += `${k}:${String(results[k])}<br>`);
      }
    }
  }

  runSingleStrategy = async (data) => {
    try{
      const user = glassState.getProfile();
      const segment = data.action == "run-gap-fill"?"gap":data.action == "run-pos-shift"?"ps":"mw";
      const body = await httpReq({method:"POST",url:`/glass/numbers/${segment}`,data,withAuth:true});
      const results = body.data;
      glassState.set("lastStrategyResults",{data,results});
      this.populateStrategyResults();
    }
    catch(e){console.error(e.message,e);}
  };
  runStrategySim = async (data) => {
    try{
      console.log(data);
      const user = glassState.getProfile();
      const body = await httpReq({method:"POST",url:`/glass/numbers/sim`,data,withAuth:true});
      const results = body.data;
      glassState.set("lastStrategySimResults",{data,results});
      this.populateStrategySimResults();
    }
    catch(e){console.error(e.message,e);}
  };
  calcComboProbility = async (data) => {
    try{
      const user = glassState.getProfile();
      const body = await httpReq({method:"POST",url:`/glass/numbers/ncr`,data,withAuth:true});
      const results = body.data;
      glassState.set("lastCalcComboResults",{data,results});
      this.populateCalcComboResults();
    }
    catch(e){console.error(e.message,e);}
  };
  deriveAlgoFromLast5 = async (data) => {
    try{
      const user = glassState.getProfile();
      const body = await httpReq({method:"POST",url:`/glass/numbers/last-4`,data,withAuth:true});
      const results = body.data;
      glassState.set("lastDerivedAlgo",{data,results});
      this.populateDerivedAlgorithm();
    }
    catch(e){console.error(e.message,e);}
  };

  init = () => {
    this.initTabs();
    this.populateStrategyResults();
    this.populateStrategySimResults();
    this.populateCalcComboResults();
  };
}
/*
export const getNewDraw = () => {
  try{
    let a = [],b = [];
    for(let i = 0;i<24;i++) a.push(i + 1);
    for(let i = 0;i<12;i++){
      const j = Math.floor(Math.random() * a.length);
      b.push(a[j]);
      a = a.filter((v,i) => i !== j);
    }
    const newDraw = b.sort((a,b) => a - b).join(" ");
    return newDraw;
  }
  catch(e){console.error(e.message,e);}
};
const other = async ({numberList}) => {
  try{
    const numArr = numberList.split(/[\s]/).map(n => Number(n));
    let a = new Array(24).fill(0);
    const a_ = a.map((v,i) => numArr.includes(i+1)?1:0);
    const results = [{name:"orig-numbers",play:numberList,dupe:false}];
    const results_unique = [];


    const shiftArr = (s = [],i,n) => {
      const myAr = [];
      const p = s.slice(i,n);
      i == 0?s.unshift(...p):s.push();
      return s;
    };
    for(const start of [0,a_.length - 1]){
      for(let n = 0;n<maxShifts;n++){
        result = shiftArr(a_,start,n+1);
        results.push({
          name:`right-shift@n=${n+1}`,
          play:result,
          dupe:false,
        });
      }
    }
    return {results};
  }
  catch(e){}
}
export const runAlgo = async ({numberList,maxInc,minTimes,maxTimes,algos,directions}) => {
  try{
    const numArr = numberList.split(/[\s]/).map(n => Number(n));
    const lastIdx = numArr.length - 1;
    const results = [{name:"orig-numbers",play:numberList,dupe:false}];
    const results_unique = [];

    for(const algo of algos){
      for(const direction of directions){
        for(let n = 1;n<maxInc + 1;n++){
          for(let t=minTimes - 1;t<maxTimes;t++){
            const newArr = [];
            let k = -1;
            for(let i=0,l = numArr.length;i<l;i++){
              const isGap = (a,b) => a && b && Math.abs(a-b) > n;
              const doInc = (a,b,posOrNeg) => isGap(a,b)?{val:a + posOrNeg * n,inc:true}:{val:a,inc:false};
              const loc = direction == 'ltr'?i:lastIdx - i;
              const lastAdded = newArr[newArr.length - 1];
              let curr = numArr[loc],prev = numArr[loc-1],next = numArr[loc+1],o;
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
                    if(!k%2) o = doInc(curr,next || 24,1);
                    else o = doInc(curr,prev || 1,-1);
                    break;
                  }
                  default:break;
                }
                o.inc?k++:null;
              }
              newArr.push(!o?curr:o.val !== lastAdded?o.val:curr);
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
  catch(e){console.error(e.message,e);}
};
export const checkError = (winList,myNumbers) => {
  try{
    const getNumberArray = (a) => a.split(/[\s\,]/).map(n => Number(n));
    const getPrize = (a) => {
      switch(true){
        case [0,12].includes(a):return 250000;
        case [1,11].includes(a):return 500;
        case [2,10].includes(a):return 50;
        case [3,9].includes(a):return 10;
        case [4,8].includes(a):return 2;
        default:return 0;

      }
    };
    const winners = getNumberArray(winList);
    const ec = {winList,plays:[],topPrize:0,topScore:0};
    myNumbers.forEach(n => {
      if(n.name !== "orig-numbers"){
        const play = getNumberArray(n.play);
        let correct = 0;
        const valid = play.length == winners.length;
        if(valid) for(let j = 0;j<play.length;j++) if(winners.includes(play[j])) correct++;
        const score = valid?Math.round(100 * correct/play.length):null;
        const prize = valid?getPrize(correct):null;

        ec.plays.push({...n,score,prize,valid});
        prize > ec.topPrize?ec.topPrize = prize:null;
        score > ec.topScore?ec.topScore = score:null;
      }
    });
    const plays = ec.plays.filter(n => !n.dupe && n.valid);
    ec.avgScore = plays.reduce((o,p) => o + p.score,0)/plays.length;
    ec.totalPlays = plays.length;
    ec.totalCost = plays.length * 2;
    ec.totalPrize = plays.reduce((o,p) => o + p.prize,0);
    ec.myProfit = ec.totalPrize - ec.totalCost;
    return ec;
  }
  catch(e){console.error(e.message,e);}
};
export const testOnce = async (data) => {
  const {results} = await runAlgo(data);
  const newDraw = getNewDraw();
  const ec = checkError(newDraw,results);
  return {ec};
}
export const numberTester = async (data) => {
  const totalDraws = Number(data.draws) || 100000;
  const maxInc = Number(data.maxInc);
  const minTimes = Number(data.minTimes);
  const maxTimes = Number(data.maxTimes);
  const allAlgos = ["add-then-sub","sub-then-add"];
  const allDirections = ["ltr","rtl"];

  const algos = data.algos == "run-all"?allAlgos:data.algos.split(",");
  const directions = data.directions == "run-all"?allDirections:data.directions.split(",");
  const arr = [];
  let numberList = getNewDraw();
  console.log(await other({numberList}))
  /*
  for(let i = 0;i<totalDraws;i++){
    const {ec} = await testOnce({numberList,maxInc,minTimes,maxTimes,algos,directions});
    arr.push({
      topPrize:ec.topPrize,
      totalPlays:ec.totalPlays,
      totalCost:ec.totalCost,
      totalPrize:ec.totalPrize,
      myProfit:ec.myProfit,
    });
    numberList = getNewDraw();
  }

  
  const totalPlays = arr.reduce((o,p) => o + p.totalPlays,0);
  const totalCost = arr.reduce((o,p) => o + p.totalCost,0);
  const totalPrize = arr.reduce((o,p) => o + p.totalPrize,0);
  const totalProfit = arr.reduce((o,p) => o + p.myProfit,0);
  const AvgProfitPerPlay = arr.reduce((o,p) => o + p.myProfit,0)/totalPlays;
  const totalReturn = (100 * totalProfit/totalCost).toFixed(0) + "%";

  console.log({
    totalDraws,
    totalPlays,
    totalCost,
    totalPrize,
    totalProfit,
    totalReturn,
    playsPerDraw:totalPlays/totalDraws,
    AvgProfitPerPlay,
  });

}
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