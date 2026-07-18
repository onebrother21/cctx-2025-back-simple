/*
import { ProfilesService as Profiles } from "./prev/profiles.service";
import { OrderService as Orders } from "./prev/order.service";
import { ReportsService as Reports } from "./prev/reports.service";
import { MessageService as Messages } from "./prev/message.service";
import { AnalyticsService as Analytics } from "./prev/analytics.service";
*/

import { LocationHelpers } from "./location-helpers.service";
import { WebSocketService as Sockets } from "./websocket.service";
import { NotificationsService as Notifications } from "./notifications.service";
import { MongooseAggHelpers } from "./mongoose-agg-helpers";

export const Services = {
  /*
  Profiles,
  Messages,
  Orders,
  Reports,
  Analytics,
  */
  Notifications,
  LocationHelpers,
  MongooseAggHelpers,
  Sockets,
};
export default Services;