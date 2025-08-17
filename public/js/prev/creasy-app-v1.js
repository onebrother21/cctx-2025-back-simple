(async function(){
  class CreasyAppManager {
    cctxId = "a8f89461-a4b7-9e14-be27-431aa14c8197";
    start = Date.now();
    salesTaxRates = {
      AL:{name:"Alabama",state:4.00,avgLocal:5.24,maxLocal:7.50},
      AK:{name:"Alaska",state:0.00,avgLocal:1.76,maxLocal:7.50},
      AZ:{name:"Arizona",state:5.60,avgLocal:2.80,maxLocal:5.60},
      AR:{name:"Arkansas",state:6.50,avgLocal:2.97,maxLocal:6.125},
      CA:{name:"California",state:7.25,avgLocal:1.57,maxLocal:2.50},
      CO:{name:"Colorado",state:2.90,avgLocal:4.87,maxLocal:8.30},
      CT:{name:"Connecticut",state:6.35,avgLocal:0.00,maxLocal:0.00},
      DE:{name:"Delaware",state:0.00,avgLocal:0.00,maxLocal:0.00},
      DC:{name:"District of Columbia",state:6.00,avgLocal:0.00,maxLocal:0.00},
      FL:{name:"Florida",state:6.00,avgLocal:1.01,maxLocal:2.00},
      GA:{name:"Georgia",state:4.00,avgLocal:3.35,maxLocal:4.90},
      HI:{name:"Hawaii",state:4.00,avgLocal:0.44,maxLocal:0.50},
      ID:{name:"Idaho",state:6.00,avgLocal:0.02,maxLocal:3.00},
      IL:{name:"Illinois",state:6.25,avgLocal:2.56,maxLocal:4.75},
      IN:{name:"Indiana",state:7.00,avgLocal:0.00,maxLocal:0.00},
      IA:{name:"Iowa",state:6.00,avgLocal:0.94,maxLocal:1.00},
      KS:{name:"Kansas",state:6.50,avgLocal:2.20,maxLocal:4.00},
      KY:{name:"Kentucky",state:6.00,avgLocal:0.00,maxLocal:0.00},
      LA:{name:"Louisiana",state:4.45,avgLocal:5.10,maxLocal:7.00},
      ME:{name:"Maine",state:5.50,avgLocal:0.00,maxLocal:0.00},
      MD:{name:"Maryland",state:6.00,avgLocal:0.00,maxLocal:0.00},
      MA:{name:"Massachusetts",state:6.25,avgLocal:0.00,maxLocal:0.00},
      MI:{name:"Michigan",state:6.00,avgLocal:0.00,maxLocal:0.00},
      MN:{name:"Minnesota",state:6.875,avgLocal:0.61,maxLocal:2.00},
      MS:{name:"Mississippi",state:7.00,avgLocal:0.07,maxLocal:1.00},
      MO:{name:"Missouri",state:4.225,avgLocal:4.06,maxLocal:5.763},
      MT:{name:"Montana",state:0.00,avgLocal:0.00,maxLocal:0.00},
      NE:{name:"Nebraska",state:5.50,avgLocal:1.44,maxLocal:2.50},
      NV:{name:"Nevada",state:6.85,avgLocal:1.38,maxLocal:1.53},
      NH:{name:"New Hampshire",state:0.00,avgLocal:0.00,maxLocal:0.00},
      NJ:{name:"New Jersey",state:6.625,avgLocal:-0.03,maxLocal:3.313},
      NM:{name:"New Mexico",state:5.125,avgLocal:2.71,maxLocal:4.313},
      NY:{name:"New York",state:4.00,avgLocal:4.52,maxLocal:4.875},
      NC:{name:"North Carolina",state:4.75,avgLocal:2.23,maxLocal:2.75},
      ND:{name:"North Dakota",state:5.00,avgLocal:1.96,maxLocal:3.50},
      OH:{name:"Ohio",state:5.75,avgLocal:1.47,maxLocal:2.25},
      OK:{name:"Oklahoma",state:4.50,avgLocal:4.47,maxLocal:7.00},
      OR:{name:"Oregon",state:0.00,avgLocal:0.00,maxLocal:0.00},
      PA:{name:"Pennsylvania",state:6.00,avgLocal:0.34,maxLocal:2.00},
      RI:{name:"Rhode Island",state:7.00,avgLocal:0.00,maxLocal:0.00},
      SC:{name:"South Carolina",state:6.00,avgLocal:1.44,maxLocal:3.00},
      SD:{name:"South Dakota",state:4.50,avgLocal:1.90,maxLocal:4.50},
      TN:{name:"Tennessee",state:7.00,avgLocal:2.55,maxLocal:2.75},
      TX:{name:"Texas",state:6.25,avgLocal:1.95,maxLocal:2.00},
      UT:{name:"Utah",state:6.10,avgLocal:1.09,maxLocal:2.95},
      VT:{name:"Vermont",state:6.00,avgLocal:0.24,maxLocal:1.00},
      VA:{name:"Virginia",state:5.30,avgLocal:0.45,maxLocal:0.70},
      WA:{name:"Washington",state:6.50,avgLocal:2.79,maxLocal:4.00},
      WV:{name:"West Virginia",state:6.00,avgLocal:0.52,maxLocal:1.00},
      WI:{name:"Wisconsin",state:5.00,avgLocal:0.43,maxLocal:1.75},
      WY:{name:"Wyoming",state:4.00,avgLocal:1.22,maxLocal:2.00},
    };
    wnfOrderItems = [
      {label:"Colors (Warm)",type:"colors-warm"},
      {label:"Colors (Cold)",type:"colors-cold"},
      {label:"Whites (Hot)",type:"whites-hot"},
      {label:"Whites/Lights (Cold)",type:"whites-cold"}
    ];
    wnfOrderPreferences = {
      detergents:[
        {label:"Tide (Original)",img:"/assets/images/wnf/tide.jpg"},
        {label:"Tide Sport",img:"/assets/images/wnf/tide-sport.jpg"},
        {label:"Tide Free & Gentle",img:"/assets/images/wnf/tide-gentle.jpg"},
        {label:"Gain (Original)",img:"/assets/images/wnf/gain.jpg"},
        {label:"Dreft ",img:"/assets/images/wnf/dreft.jpg"},
        {label:"Cheer Colorguard",img:"/assets/images/wnf/cheer-colorguard.jpg"}
      ],
      softeners:[
        {label:"Downy (Original)",img:"/assets/images/wnf/downy-soft-2.jpg"},
        {label:"Downy Free & Gentle",img:"/assets/images/wnf/downy-soft.jpg"},
        {label:"Snuggle",img:"/assets/images/wnf/snuggle-soft.jpg"}
      ],
      dryerSheets:[
        {label:"Bounce",img:"/assets/images/wnf/bounce.jpg"},
        {label:"Snuggle",img:"/assets/images/wnf/snuggle.jpg"}
      ]
    };
    possibleCCMonths = [1,2,3,4,5,6,7,8,9,10,11,12];
    possibleCCYears = this.possibleCCMonths.map((o,i) => new Date().getFullYear()+i);
    availableServiceTimes = [4,5,6,7,8].reduce((o,p) => [...o,`${p}:00 pm`,`${p}:30 pm`],[]);
    get wnfPricePerLoad(){return this.appInfo.wnfPricePerLoad;}
    get wnfPreferenceCharge(){return this.appInfo.wnfPreferenceCharge;}
    get cutoffTime(){return this.appInfo.newOrderCutoffTime;}
    constructor(config){Object.assign(this,config);}
    getStateFromZip(zipString){
      /* Ensure param is a string to prevent unpredictable parsing results */
      if(typeof zipString !== 'string'){
          console.log('Must pass the zipcode as a string.');
          return;
      }
      /* Ensure we have exactly 5 characters to parse */
      if(zipString.length !== 5){
          console.log('Must pass a 5-digit zipcode.');
          return;
      }
      /* Ensure we don't parse strings starting with 0 as octal values */
      const zipcode = parseInt(zipString,10);
      let st = "",state = "";
      /* Code cases alphabetized by state */
      if(zipcode >= 35000 && zipcode <= 36999){st = 'AL';state = 'Alabama';}
      else if(zipcode >= 99500 && zipcode <= 99999){st = 'AK';state = 'Alaska';}
      else if(zipcode >= 85000 && zipcode <= 86999){st = 'AZ';state = 'Arizona';}
      else if(zipcode >= 71600 && zipcode <= 72999){st = 'AR';state = 'Arkansas';}
      else if(zipcode >= 90000 && zipcode <= 96699){st = 'CA';state = 'California';}
      else if(zipcode >= 80000 && zipcode <= 81999){st = 'CO';state = 'Colorado';}
      else if((zipcode >= 6000 && zipcode <= 6389) || (zipcode >= 6391 && zipcode <= 6999)){st = 'CT';state = 'Connecticut';}
      else if(zipcode >= 19700 && zipcode <= 19999){st = 'DE';state = 'Delaware';}
      else if(zipcode >= 32000 && zipcode <= 34999){st = 'FL';state = 'Florida';}
      else if((zipcode >= 30000 && zipcode <= 31999) || (zipcode >= 39800 && zipcode <= 39999)){st = 'GA';state = 'Georgia';}
      else if(zipcode >= 96700 && zipcode <= 96999){st = 'HI';state = 'Hawaii';}
      else if(zipcode >= 83200 && zipcode <= 83999){st = 'ID';state = 'Idaho';}
      else if(zipcode >= 60000 && zipcode <= 62999){st = 'IL';state = 'Illinois';}
      else if(zipcode >= 46000 && zipcode <= 47999){st = 'IN';state = 'Indiana';}
      else if(zipcode >= 50000 && zipcode <= 52999){st = 'IA';state = 'Iowa';}
      else if(zipcode >= 66000 && zipcode <= 67999){st = 'KS';state = 'Kansas';}
      else if(zipcode >= 40000 && zipcode <= 42999){st = 'KY';state = 'Kentucky';}
      else if(zipcode >= 70000 && zipcode <= 71599){st = 'LA';state = 'Louisiana';}
      else if(zipcode >= 3900 && zipcode <= 4999){st = 'ME';state = 'Maine';}
      else if(zipcode >= 20600 && zipcode <= 21999){st = 'MD';state = 'Maryland';}
      else if((zipcode >= 1000 && zipcode <= 2799) || (zipcode == 5501) || (zipcode == 5544 )){st = 'MA';state = 'Massachusetts';}
      else if(zipcode >= 48000 && zipcode <= 49999){st = 'MI';state = 'Michigan';}
      else if(zipcode >= 55000 && zipcode <= 56899){st = 'MN';state = 'Minnesota';}
      else if(zipcode >= 38600 && zipcode <= 39999){st = 'MS';state = 'Mississippi';}
      else if(zipcode >= 63000 && zipcode <= 65999){st = 'MO';state = 'Missouri';}
      else if(zipcode >= 59000 && zipcode <= 59999){st = 'MT';state = 'Montana';}
      else if(zipcode >= 27000 && zipcode <= 28999){st = 'NC';state = 'North Carolina';}
      else if(zipcode >= 58000 && zipcode <= 58999){st = 'ND';state = 'North Dakota';}
      else if(zipcode >= 68000 && zipcode <= 69999){st = 'NE';state = 'Nebraska';}
      else if(zipcode >= 88900 && zipcode <= 89999){st = 'NV';state = 'Nevada';}
      else if(zipcode >= 3000 && zipcode <= 3899){st = 'NH';state = 'New Hampshire';}
      else if(zipcode >= 7000 && zipcode <= 8999){st = 'NJ';state = 'New Jersey';}
      else if(zipcode >= 87000 && zipcode <= 88499){st = 'NM';state = 'New Mexico';}
      else if((zipcode >= 10000 && zipcode <= 14999) || (zipcode == 6390) || (zipcode == 501) || (zipcode == 544)){st = 'NY';state = 'New York';}
      else if(zipcode >= 43000 && zipcode <= 45999){st = 'OH';state = 'Ohio';}
      else if((zipcode >= 73000 && zipcode <= 73199) || (zipcode >= 73400 && zipcode <= 74999)){st = 'OK';state = 'Oklahoma';}
      else if(zipcode >= 97000 && zipcode <= 97999){st = 'OR';state = 'Oregon';}
      else if(zipcode >= 15000 && zipcode <= 19699){st = 'PA';state = 'Pennsylvania';}
      else if(zipcode >= 300 && zipcode <= 999){st = 'PR';state = 'Puerto Rico';}
      else if(zipcode >= 2800 && zipcode <= 2999){st = 'RI';state = 'Rhode Island';}
      else if(zipcode >= 29000 && zipcode <= 29999){st = 'SC';state = 'South Carolina';}
      else if(zipcode >= 57000 && zipcode <= 57999){st = 'SD';state = 'South Dakota';}
      else if(zipcode >= 37000 && zipcode <= 38599){st = 'TN';state = 'Tennessee';}
      else if( (zipcode >= 75000 && zipcode <= 79999) || (zipcode >= 73301 && zipcode <= 73399) ||  (zipcode >= 88500 && zipcode <= 88599)){
        st = 'TX';
        state = 'Texas';
      }
      else if(zipcode >= 84000 && zipcode <= 84999){st = 'UT';state = 'Utah';}
      else if(zipcode >= 5000 && zipcode <= 5999){st = 'VT';state = 'Vermont';}
      else if((zipcode >= 20100 && zipcode <= 20199) || (zipcode >= 22000 && zipcode <= 24699) || (zipcode == 20598)){
        st = 'VA';
        state = 'Virginia';
      }
      else if((zipcode >= 20000 && zipcode <= 20099) || (zipcode >= 20200 && zipcode <= 20599) || (zipcode >= 56900 && zipcode <= 56999)){
        st = 'DC';
        state = 'Washington DC';
      }
      else if(zipcode >= 98000 && zipcode <= 99499){st = 'WA';state = 'Washington';}
      else if(zipcode >= 24700 && zipcode <= 26999){st = 'WV';state = 'West Virginia';}
      else if(zipcode >= 53000 && zipcode <= 54999){st = 'WI';state = 'Wisconsin';}
      else if(zipcode >= 82000 && zipcode <= 83199){st = 'WY';state = 'Wyoming';}
      else {
        st = 'none';
        state = 'none';
        console.log('No state found matching',zipcode);
      }
      return st;
    }
    getSalesTaxRatesByState(state){return this.salesTaxRates[state];}
    canCalulate(amt,state){return "number" == typeof amt && this.getSalesTaxRatesByState(state);}
    getCombinedRateByState(state){
      if(this.canCalulate(0,state)){
        const rates = this.getSalesTaxRatesByState(state);
        return rates.state + rates.avgLocal;
      }
      return null;
    }
    getCombinedMaxRateByState(state){
      if(this.canCalulate(0,state)){
        const rates = this.getSalesTaxRatesByState(state);
        return rates.state + rates.maxLocal;
      }
      return null;
    }
    getStateSalesTaxRatePct(state){return this.getSalesTaxRatesByState(state).state + "%";}
    getStateSalesTaxRate(state){return this.getSalesTaxRatesByState(state).state/100;}
    getStateSalesTax(amt,state){return this.canCalulate(amt,state)?this.getStateSalesTaxRate(state) * amt:null;}
    getCombinedSalesTaxRatePct(state){return this.getCombinedRateByState(state) + "%";}
    getCombinedSalesTaxRate(state){return this.getCombinedRateByState(state)/100;}
    getCombinedSalesTax(amt,state){return this.canCalulate(amt,state)?this.getCombinedSalesTaxRate(state) * amt:null;}
    getCombinedMaxSalesTaxRatePct(state){return this.getCombinedMaxRateByState(state) + "%";}
    getCombinedMaxSalesTaxRate(state){return this.getCombinedMaxRateByState(state)/100;}
    getCombinedMaxSalesTax(amt,state){return this.canCalulate(amt,state)?this.getCombinedMaxSalesTaxRate(state) * amt:null;}
    getFirstAvailableDateOfService(){
      const today = new Date();
      const today_ = new Date();
      const cot_AmPm = this.cutoffTime.split(" ")[0];
      const cot_Hrs = Number(cot_AmPm.split("am")[0].split("pm")[0]);
      const cot_24 = /pm/.test(cot_AmPm)?cot_Hrs == 12?12:12 + cot_Hrs:cot_Hrs == 12?0:cot_Hrs;
      const isAfterCutoff = today > new Date(today_.setHours(cot_Hrs,0,0));
      const firstAvailable = isAfterCutoff?new Date(today_.setDate(today.getDate() + 1)):today;
      return firstAvailable;
    }
    getSalesTaxRatePctFromZip(zip,max = false){
      const state = this.getStateFromZip(zip);
      return max?this.getCombinedMaxSalesTaxRatePct(state):this.getCombinedSalesTaxRatePct(state);
    }
    getSalesTaxFromZip(amt,zip,max = false){
      const state = this.getStateFromZip(zip);
      return max?this.getCombinedMaxSalesTax(amt,state):this.getCombinedSalesTax(amt,state);
    }
    roundToTwoPlaces(n){return "number" == typeof n?Number(n.toFixed(2)):n;}
    calculateCharges(o){
      if(o && o.vendor && o.items && o.zip && o.mileage){
        try{
          const amt = {};
          const corpRates = this.appInfo.corpRates;
          const vendor = o.vendor || {};
          const vendorRates = vendor.rates || {starch:0};
          const laundry = o.items.reduce((q,p) => q + p.price,0);
          const starch = o.items.reduce((q,p) => p.starch?q + 1:q,0) * vendorRates.starch;
          const service = laundry * corpRates.service;
          const transit = o.mileage * corpRates.transit;//ready to do distance cost calcs
          const subtotal = 0 + laundry + starch + transit;
          const taxRate = this.getSalesTaxRatePctFromZip(o.zip,true);
          const tax = this.getSalesTaxFromZip(subtotal,o.zip,true);
          const tip = o.amt?.tip||0;
          const total = subtotal + tax + tip;
          const amt_ = {laundry,starch,service,transit,subtotal,taxRate,tax,tip,total};
          for(const k in amt_) amt[k] = this.roundToTwoPlaces(amt_[k]);
          return amt;
        }
        catch(e){console.warn(e);return null;}
      }
      return null;
    }
  }
  window.Creasy = function loadCreasy(config){return new CreasyAppManager(config);};
})(window);