import UpcentricModels from "../../models";
import UpcentricTypes from "../../types";

import Models from "../../../../models";
import Types from "../../../../types";
import Utils from '../../../../utils';
import Services from '../../../../services';

export class TasksQueriesService {
  // 📌 Task Queries
  static queryTasks = async ({location,...query_}:any,select:string[],opts?:any,timestamp?:number) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;

    const {pts,radius = 5,unit = "mi"} = location || {};
    const searchRadius = radius/(unit == "mi"?3963.2:6371);
    const locationQ = {"loc":{$geoWithin:{$centerSphere:[pts,searchRadius]}}};
    const query = {...query_,...(location?locationQ:{})};
    
    const pipeline:any[] = [];

    const projections = {
      creator:{
        id:"$creator._id",
        name:"$creator.name",
        displayName:"$creator.displayName",
        org:"$creator.org",
        img:"$creator.img.url",
      },
      admin:{
        id:"$admin._id",
        name:"$admin.name",
        displayName:"$admin.displayName",
        org:"$admin.org",
        img:"$admin.img.url",
      },
      pets: { 
        $filter:{ 
          input: "$log",
          as: "log",
          cond: { $not: { $in: ["$$log.status", [null, "",undefined]] } }
        }
      } 
    };
    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach(k => k !== "id"?o[k] = { $first: "$"+k }:null);
      //Utils.log(o);
      return o;
    };
    const selectProjections = (fields:string[]) => {
      const o:any = {_id:0};
      fields.forEach(k => o[k] = k == "id"?"$_id":projections[k] || 1);
      //Utils.info(o);
      return o;
    };
    const formatResultsWithDistCalc = (results:any[]) => results.map(o => {
      return !location?o:{
        ...o,
        subject:{
          ...o.subject,
          ...location && o.subject.addr?{addr:{
            ...o.subject.addr,
            ...(select.includes("dist")?{dist:Utils.calculateDistance(pts,o.subject.addr.loc,{unit,toFixed:4})}:{}),
            ...(select.includes("distUnit")?{distUnit:unit}:{}),
          }}:{}
        }
      };
    });
    pipeline.push(
      { $lookup: {from: "upcentric_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
      { $unwind: "$creator"},
      { $lookup: {from: "upcentric_profiles",localField: "admin",foreignField: "_id",as: "admin"}},
      { $unwind: {path: '$admin',preserveNullAndEmptyArrays: true}},
      { $project:  selectProjections(select)},
      { $addFields: {
        start_on:{"$toDouble":"$startOn"},
        due_on: { "$toDouble": "$dueOn" },
        created: { "$toDouble": "$createdOn" },
        assigned: { "$toDouble": "$meta.assigned" },
        completed: { "$toDouble": "$meta.completed" },
        cancelled: { "$toDouble": "$meta.cancelled" },
        rejected: { "$toDouble": "$meta.rejected" },
        status: {$arrayElemAt:["$log.status",-1]}//last status update
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
    );
    // Utils.trace({query});
    let results = formatResultsWithDistCalc(await UpcentricModels.Task.aggregate(pipeline));
    return { results };
  };
  static queryProfiles = async ({location,...query_}:any,select:string[],opts?:any,timestamp?:number) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;

    const {pts,radius = 5,unit = "mi"} = location || {};
    const searchRadius = radius/(unit == "mi"?3963.2:6371);
    const locationQ = {"addrs.loc":{"$geoWithin":{"$centerSphere":[pts,searchRadius]}}};

    const query = {...query_,...(location?locationQ:{})};
    const pipeline:any[] = [];

    const projections = {
      addr:{info:"$addrs.info",loc:"$addrs.loc.coordinates"},
      img:"$img.url",
    };
    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach(k => k !== "id"?o[k] = { $first: "$"+k }:null);
      //Utils.log(o);
      return o;
    };
    const selectProjections = (fields:string[]) => {
      const o:any = {_id:0};
      fields.forEach(k => o[k] = k == "id"?"$_id":projections[k] || 1);
      //Utils.info(o);
      return o;
    };
    const formatResultsWithDistCalc = (results:any[]) => results.map(o => {
      return {
        ...o,
        ...location && o.addr?{addr:{
          ...o.addr,
          ...(select.includes("dist")?{dist:Utils.calculateDistance(pts,o.addr.loc,{unit,toFixed:4})}:{}),
          ...(select.includes("distUnit")?{distUnit:unit}:{}),
        }}:{}
      };
    });
    pipeline.push(
      { $unwind:{
        path:"$addrs",
        "preserveNullAndEmptyArrays": true
      }},
      { $addFields: {
        addr:"$addrs",
        created_on: { "$toDouble": "$createdOn" },
        status: {$arrayElemAt:["$log.status",-1]}//last status update
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $project:  selectProjections(select)},
    );
    
    //Utils.trace({query});
    const results = formatResultsWithDistCalc(await Models.Profile.aggregate(pipeline));
    return { results };
  };
}