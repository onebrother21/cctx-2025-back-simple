
type Entity<Status extends string|number> = {status:Status;}
& Record<"id"|"desc",string>
& Record<"info"|"meta",Primitives>
& Record<"createdOn"|"updatedOn",Date>;

type CreatorTypes = "creator"|"author"|"sender"|"user";
type CreatorObj<
Creator extends Entity<string>|undefined = undefined,
CreatorType extends CreatorTypes|undefined = "creator"
> = Creator extends undefined?{}:Record<`${CreatorType}Id`,ObjectId_> & Record<`${CreatorType}`,Creator>;

type DocEntityObj<T,
Status extends string|number,
Creator extends Entity<string>|undefined = undefined,
CreatorType extends CreatorTypes|undefined = "creator"
> = T & Entity<Status> & Document_ & CreatorObj<Creator,CreatorType> & {
  __v:number;
};
type DocEntity<O,J = O,P = J> = O extends DocEntityObj<infer T,infer S,infer C,infer CT>?
O & {
  saveMe():Promise<void>;
  updateMe(updates:any):Promise<void>;
  populateMe():Promise<void>;
  json(mine?:boolean):Partial<J>;
  preview():Partial<P>;
  asyncJson(mine?:boolean):Promise<Partial<J>>;
}:never;
type CollectionNames = "mine"|"recent"|"search"|"featured"|"trending";
type Collection<C extends CollectionNames,T> = {
  items:Record<C,T[]> & {new_:Partial<T>;};
  selected:{collection:C;i:number;id:string}|null;
};

type DeletedEntity = {id:string;ok:AnyBoolean;};