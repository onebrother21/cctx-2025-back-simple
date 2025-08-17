import { Job } from 'bullmq';
import { Model } from 'mongoose';
import path from 'path';
import Utils from "../utils";

export const bulkEditCollection = async (job:Job) => {
  try {
    const { newProps, modelName } = job.data;
    if (!(newProps || modelName))  throw new Error("Missing required job data");
    const pathToModel = path.join(__dirname,`../models/${modelName}.model`);
    const model = (await import(pathToModel)).default as Model<any>;
    const documents = await model.find({});
    let i = 0;
    for (let doc of documents) {
      doc.set(newProps);
      await doc.save();
      i++;
    }
    return {updatedDocs:i};
  } catch (error) {
    console.error("Error processing bulk update:", error);
    throw error;
  }
};
export default bulkEditCollection;