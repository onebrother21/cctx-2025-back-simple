import { Job } from 'bullmq';
import Models from '../apps/upcentric/models';
import Services from '../services';
import Types from '../types';
import Utils from '../utils';

export const clockBugs = async (job:Job) => {
  try {
    const bug = new Models.Task(job.data);
    await bug.save();
    return {ok:true};
  }
  catch (error) {
    console.error('Error clocking bugs:', error);
    throw error;
  }
};
export default clockBugs;