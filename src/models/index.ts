import AppDevice from "./app-device.model";
import AppUsage from "./app-usage.model";
import User from './user.model';
import Profile from './profile.model';
import BusinessVars from './bvars.model';
import Notification from './notification.model';
import AuthToken,{DeadToken} from "./auth-token.model";

const Models = {
  AppDevice,
  AppUsage,
  User,
  Profile,
  BusinessVars,
  Notification,
  AuthToken,
  DeadToken,
};
export default Models;