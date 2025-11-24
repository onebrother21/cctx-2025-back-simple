
import axios from 'axios';
const locationIQUrl = process.env.LOCATION_IQ_URL;
const locationIQKey = process.env.LOCATION_IQ_KEY;

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
export function calculateMileage([lon1,lat1],[lon2,lat2]){
  const r = 3963.0; // mi
  const p = Math.PI / 180;
  const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
  return 2 * r * Math.asin(Math.sqrt(a));
};
export async function lookupAddresses(addrs:AddressObj[]){
  for(let i = 0,j = addrs.length;i<j;i++){
    let addr = addrs[i];
    const queryStr = `key=${locationIQKey}`+
    `${addr.streetAddr?"&street="+addr.streetAddr:""}`+
    `${addr.city?"&city="+addr.city:""}`+
    `${addr.state?"&state="+addr.state:""}`+
    `${addr.postal?"&postalCode="+addr.postal:""}`+
    `${addr.country?"&country="+addr.country:""}`+
    `&format=json`;
    const options = {
      method: 'GET',
      url:locationIQUrl+queryStr,
      headers: {accept: 'application/json'}
    };
    try {
      const res = await axios.request(options);
      if(res.data && res.data[0] && res.data[0].display_name){
        const {lat,lon,display_name} = res.data[0];
        const allNumArray = display_name.replaceAll(" ","").split(",").filter((s:string) => /^[0-9]+$/.test(s));
        addr.postal = allNumArray[allNumArray.length - 1];
        addr.info = display_name,
        addr.loc = {type:"Point",coordinates:[lon,lat]};
      }
    }
    catch(err){console.error(err);}
    addrs[i] = addr;
  }
  return addrs;
};
