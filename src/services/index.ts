/*
import { ProfilesService as Profiles } from "./profiles.service";
import { OrderService as Order } from "./order.service";

import { ReportsService as Reports } from "./reports.service";
import { GeoService as Geo } from "./geo.service";
import { MessageService as Message } from "./message.service";
import { WebSocketService as Sockets } from "./websocket.service";
import { AnalyticsService as Analytics } from "./analytics.service";
*/

import { GeoService as Geo } from "./geo.service";
import { NotificationService as Notifications } from "./notification.service";
import { WebSocketService as Sockets } from "./websocket.service";

export const Services = {
  // Order,
  Notifications,
  // Reports,
  Geo,
  // Message,
  Sockets,
  // Analytics,
};
export default Services;