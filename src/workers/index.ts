import doRandomSleep from "./random-sleep";
import sendNotifications from "./send-notifications";
// import autoAssignCouriers from "./random-sleep";
import bulkEditCollection from "./bulk-edit-collection";
import logData from "./log-data";
import clockBugs from "./clock-bugs";
import tokenCleanUp from "./token-cleanup";
import { Job } from "bullmq";

export enum MyQueueNames {
  RANDOM_SLEEP = "random-sleep",
  SEND_NOTIFICATIONS = "send-notifications",
  //BULK_EDIT_COLLECTION = "bulk-edit-collection",
  LOG_DATA = "log-data",
  // CLOCK_BUGS = "clock-bugs",
  TOKEN_CLEANUP = 'token-cleanup',
}

export const MyWorkerProcessors:Record<MyQueueNames,(job:Job) => Promise<any>> = {
  [MyQueueNames.RANDOM_SLEEP]:doRandomSleep,
  [MyQueueNames.SEND_NOTIFICATIONS]:sendNotifications,
 // [MyQueueNames.AUTO_ASSIGN_COURIERS]:autoAssignCouriers,
 // [MyQueueNames.BULK_EDIT_COLLECTION]:bulkEditCollection,
  [MyQueueNames.LOG_DATA]:logData,
  //[MyQueueNames.CLOCK_BUGS]:clockBugs,
  [MyQueueNames.TOKEN_CLEANUP]:tokenCleanUp,
}