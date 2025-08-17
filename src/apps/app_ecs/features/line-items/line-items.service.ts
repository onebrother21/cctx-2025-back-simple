import ECSModels from  "../../models";
import ECSTypes from "../../types";

import Models from '../../../../models';
import Types from "../../../../types";
import Utils from '../../../../utils';
import Services from '../../../../services';
import { uploadFields } from "../../../../middlewares";

const notify = Services.Notifications.createNotification;


import axios from 'axios';

const queryOpts = { new:true,runValidators: true,context:'query' };
const locationIQKey = process.env.LOCATION_IQ_KEY;
const {NEW,ACTIVE,ASSIGNED,COMPLETED,CANCELLED,PENDING,IN_PROGRESS,CLOSED} = ECSTypes.IFinancialLineItemStatuses;

export class FinancialLineItemsService {
  // 📌 FinancialLineItem CRUD Ops
  static createFinancialLineItem = async (creator:string,newFinancialLineItem:Partial<ECSTypes.IFinancialLineItem>) => {
    const item = new ECSModels.FinancialLineItem({creator,meta:{submittedOn:new Date()},...newFinancialLineItem});
    await item.saveMe();
    return {item};
  };
  static getFinancialLineItemById = async (itemId:string) => {
    const item = await ECSModels.FinancialLineItem.findById(itemId);
    if(!item) throw new Utils.AppError(422,'Requested item not found');
    await item.populateMe();
    return {item};
  };
  static updateFinancialLineItem = async (itemId:string,{notes,...updates}:any) => {
    const item = await ECSModels.FinancialLineItem.findByIdAndUpdate(itemId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!item) throw new Utils.AppError(422,'Requested item not found');
    await item.populateMe();
    return {item};
  };
  static deleteFinancialLineItem = async (itemId:string) => {
    const item = await ECSModels.FinancialLineItem.findByIdAndDelete(itemId);
    if (!item) throw new Utils.AppError(422,'Requested item not found');
    return {ok:true};
  };
  // 📌 FinancialLineItem Queries
  static queryFinancialLineItems = async ({location,...query_}:any,select:string[],opts:any = {},timestamp?:number) => {
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
      creator:{id:"$creator._id",name:"$creator.name",username:"$creator.username" },
    };
    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach(k => k !== "id"?o[k] = { $first: "$"+k }:null);
      Utils.log(o);
      return o;
    };
    const selectProjections = (fields:string[]) => {
      const o:any = {_id:0};
      fields.forEach(k => o[k] = k == "id"?"$_id":projections[k] || 1);
      Utils.info(o);
      return o;
    };
    const formatResultsWithDistCalc = (results:any[]) => results.map(o => {
      return {
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
      { $lookup: {from: "users",localField: "creator",foreignField: "_id",as: "creator"}},
      { $unwind: "$creator"},
      { $addFields: {
        created_on: { "$toDouble": "$createdOn" },
        submitted_on: { "$toDouble": "$meta.submittedOn" },
        due_on: { "$toDouble": "$meta.dueOn" },
        billed_on: { "$toDouble": "$meta.billedOn" },
        sent_on: { "$toDouble": "$meta.sentOn" },
        paid_on: { "$toDouble": "$meta.paidOn" },
        status: {$arrayElemAt:["$statusUpdates.name",-1]}//last status update
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $project:  selectProjections(select)},
    );
    Utils.trace({query});
    let results = /*formatResultsWithDistCalc*/(await ECSModels.FinancialLineItem.aggregate(pipeline));
    return { results };
  };
}