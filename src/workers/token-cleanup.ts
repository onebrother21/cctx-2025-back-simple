import { Job } from 'bullmq';
import Models from '../models';
import Types from "../types";
import Utils from '../utils';

export const tokenCleanUp = async (job:Job) => {
  const requestBody = job.data.requestBody;
  try {
    const now = Math.floor(Date.now() / 1000); // Current time in UNIX seconds

    // Calculate expiration thresholds
    const refreshTokenExpiry = now - 7 * 24 * 60 * 60; // 7 days ago
    const accessTokenExpiry = now - 60 * 60; // 1 hour ago

    // Delete refresh tokens older than 7 days
    await Models.AuthToken.deleteMany({type:'refresh',exp:{$lt:refreshTokenExpiry}});

    // Delete dead access tokens older than 1 hour
    await Models.DeadToken.deleteMany({type:'access',exp:{$lt:accessTokenExpiry}});

    Utils.info('Expired tokens cleanup completed.');
  }
  catch (error) {
    Utils.error('Error processing token cleaup:', error);
    throw error;
  }
};
export default tokenCleanUp;