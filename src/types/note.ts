import * as Users from './user.types';

export type INoteType = DocEntity<any> & {
  user:Users.IUser;
  msg:string;
  time:Date;
  slug:string;
  info:any;
};
export interface INoteMethods {
  json():Partial<INote>;
}
export interface INote extends INoteType,INoteMethods {}