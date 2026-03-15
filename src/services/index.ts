/*
import { ProfilesService as Profiles } from "./prev/profiles.service";
import { OrderService as Order } from "./prev/order.service";
import { ReportsService as Reports } from "./prev/reports.service";
import { MessageService as Message } from "./prev/message.service";
import { AnalyticsService as Analytics } from "./prev/analytics.service";
*/
import { LocationHelpers } from "./location-helpers.service";
import { WebSocketService as Sockets } from "./websocket.service";
import { NotificationService as Notifications } from "./notification.service";
import { MongooseAggHelpers } from "./mongoose-agg-helpers";

export const Services = {
  /*
  Message,
  Order,
  Reports,
  Analytics,
  */
  Notifications,
  LocationHelpers,
  MongooseAggHelpers,
  Sockets,
};
export default Services;