import { Job } from 'bullmq';
import Utils from "../utils";

export const logData = async (job:Job) => {
  Utils.print("debug","log-data-worker",job.data);
  return { jobId: `This is the return value of job (${job.id})` };
};
export default logData;