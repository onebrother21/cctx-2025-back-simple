import { Job } from 'bullmq';
import Types from "../types";
import Utils from '../utils';

export const doRandomSleep = async (job:Job) => {
  for (let i = 0; i <= 100; i++) {
    await Utils.sleep(Math.random());
    await job.updateProgress(i);
    await job.log(`Processing job at interval ${i}`);
    if (Math.random() * 200 < 1) throw new Error(`Random error ${i}`);
  }
  return { jobId: `This is the return value of job (${job.id})` };
};
export default doRandomSleep;