import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

const {LocationHelpers} = Services;

export class AdminService {
  static queryAppUsage = async (
    {locQuery,...query}:Types.IAppUsageQuery,
    select:string[],
    opts?:any,
    timestamp?:number,
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'when';
    const sortOrder = opts?.order || -1;
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery  || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["where"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    const pipeline:any[] = [];
    const projections:any = {};

    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach((k) => {
        if (k === "id") return;
        o[k] = { $first: "$" + k };
      });
      return o;
    };
    const selectProjections = (fields: string[]) => {
      const o: any = { _id: 0 };
      fields.forEach((k) => (o[k] = k === "id" ? "$_id" : projections[k] || 1));
      return o;
    };
    pipeline.push(
      { $addFields: {
        when_date: { "$toDouble": "$when" },
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $skip: skip },
      { $limit: limit },
      { $project:  selectProjections(select)},
    );
    const results_ = await Models.AppUsage.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    Utils.log(Utils.flattenObject(results[0]));
    return { results };
  };
}
export default AdminService;