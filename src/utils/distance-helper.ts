import axios from 'axios';

const locationIQUrl = process.env["LOCATION_IQ_URL"];
const locationIQObjUrl = process.env["LOCATION_IQ_OBJ_URL"];
const locationIQKey = process.env["LOCATION_IQ_KEY"];

export function calculateDistance([lon1,lat1]:number[],[lon2,lat2]:number[],{toFixed,unit = "mi"}:{toFixed?:number,unit?:"mi"|"km"}): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = unit == "mi" ? 3963.2 : 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const raw = R * c;

  return typeof toFixed === "number"?Number((raw).toFixed(toFixed)):raw;
}
export function calculateMileage([lon1,lat1]:number[],[lon2,lat2]:number[]){
  const r = 3963.0; // mi
  const p = Math.PI / 180;
  const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
  return 2 * r * Math.asin(Math.sqrt(a));
};
export async function lookupAddresses(addrs:string[]|AddressObj[]):
Promise<Pick<AddressObj,"info"|"loc">[]>{
  const key = `key=${locationIQKey}`;
  const results = [];
  let url = "";
  for(let i = 0,j = addrs.length;i<j;i++){
    const addr = addrs[i];
    switch(typeof addr){
      case "string":url=`${locationIQUrl}${key}&q=${addr}&format=json`;break;
      default:{
        url=`${locationIQObjUrl}${key}`+
        `${addr.info?"&display_name="+addr.info:""}`+
        `${addr.streetAddr?"&street="+addr.streetAddr:""}`+
        `${addr.city?"&city="+addr.city:""}`+
        `${addr.state?"&state="+addr.state:""}`+
        `${addr.postal?"&postalCode="+addr.postal:""}`+
        `${addr.country?"&country="+addr.country:""}`+
        `&format=json`;
        break;
      }
    }
    const opts = {method:'GET',url,headers:{accept:'application/json'}};
    try {
      const res = await axios.request(opts);
      if(res.data && res.data.length) results.push(
        ...res.data.map((o:any) => ({info:o.display_name,loc:[o.lon,o.lat]}))
      );
    }
    catch(err:any){console.error(err.message);}
  }
  return results;
};