type Entity<Status extends string|number> = 
{status:Status} &
Record<"id"|"desc",string> & 
Record<"info"|"meta",MiscInfo> & 
Record<"createdOn"|"updatedOn",Date>;

type DocEntity<Status extends string,Creator extends any|never> = Entity<Status> & Document_ & {
  creator:Creator extends any?Creator:never;
};

type CollectionNames = "mine"|"recent"|"search"|"featured"|"trending";
type Collection<C extends CollectionNames,T> = {
  items:Record<C,T[]> & {new_:Partial<T>;};
  selected:{collection:C;i:number;id:string}|null;
};

type DeletedEntity = {id:string;ok:AnyBoolean;};