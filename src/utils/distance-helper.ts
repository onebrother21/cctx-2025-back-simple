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
