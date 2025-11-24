import * as Users from './user.types';
export enum INoteActions {NOTE_CREATED = 15,NOTE_SAVED = 16}
export type INoteType = DocEntity & {
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