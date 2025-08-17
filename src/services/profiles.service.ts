import { Model } from 'mongoose';
import Models from '../models';
import Types from "../types";
import Utils from '../utils';

const profileModels:Record<Types.IProfileTypes,Model<any>> = {
  customer:Models.Customer,
  courier:Models.Courier,
  vendor:Models.Vendor,
  admin:Models.Admin
};
export class ProfilesService {
  /**
   * To check for existing user
   */
  static getProfile = async (email: string) => await Models.User.findOne({ email });
  /**
   * Sign up a new user
   */
  static createProfile = async (role:Types.IProfileTypes,user:Types.IUser,loc:number[]) =>  {
    const model = profileModels[role];
    const profile = new model({
      user:user._id,
      name:user.name.first + " " + user.name.last,
      displayName:user.username,
      location:{type:"Point",coordinates:loc},
    }) as Types.IAdmin|Types.ICourier|Types.ICustomer|Types.IVendor;
    await profile.save();
    return {profile};
  }
  static updateProfile = async (role:Types.IProfileTypes,profileId:string,updates:any) => {
    const model = profileModels[role];
    const options = {new:true,runValidators:true};
    const profile = await model.findByIdAndUpdate(profileId,updates,options);
    return {profile};
  };
}