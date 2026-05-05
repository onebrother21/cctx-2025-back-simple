
type Entity<Status extends string|number> = {status:Status;}
& Record<"id"|"desc",string>
& Record<"info"|"meta",MiscInfo>
& Record<"createdOn"|"updatedOn",Date>;

type CreatorTypes = "creator"|"author"|"sender";
type DocEntity<
Status extends string|number,
Creator extends Entity<string>|null = null,
CreatorType extends CreatorTypes = "creator"> = 
Entity<Status> & Document_ & (Creator extends null?{}:(
  Record<`${CreatorType}Id`,ObjectId_> &
  Record<CreatorType,Creator> & {
  __v:number;
}));

type CollectionNames = "mine"|"recent"|"search"|"featured"|"trending";
type Collection<C extends CollectionNames,T> = {
  items:Record<C,T[]> & {new_:Partial<T>;};
  selected:{collection:C;i:number;id:string}|null;
};

type DeletedEntity = {id:string;ok:AnyBoolean;};