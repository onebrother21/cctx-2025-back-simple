import { Job } from 'bullmq';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';

export const tokenCleanUp = async (job:Job) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const refreshTokenExpiry = now - 7 * 24 * 60 * 60; // 7 days ago
    const accessTokenExpiry = now - 60 * 60; // 1 hour ago
    const a = await Models.AuthToken.deleteMany({type:'refresh',exp:{$lt:refreshTokenExpiry}});
    const b = await Models.DeadToken.deleteMany({type:'access',exp:{$lt:accessTokenExpiry}});
    return {deletedAuth:a,deletedRefresh:b};
  }
  catch (error:any) {
    job.failedReason = error.message;
    Utils.error('Error processing token cleaup:', error);
    throw error;
  }
};
export default tokenCleanUp;