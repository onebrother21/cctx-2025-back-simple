import JPMoneyModels from "../../models";
import DegenPokerTypes from "../../types";

import Models from "../../../../../models";
import Types from "../../../../../types";
import Utils from '../../../../../utils';
import Services from '../../../../../services';



const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class DegenPlayersService {
  // 📌 DegenPlayer CRUD Ops
  static registerPlayer = async (req:IRequest) => {
    type PlayerInit = Partial<Types.IProfile> & LocationObj;
    const {loc,...data} = req.body.data as PlayerInit;
    const user = req.user as Types.IUser;
    if(data.app !== "degen-poker") throw new AppError(400,"wrong app!");
    const role = data.app+"-"+data.type;

    const player = new Profile({
      creator:req.user.id,
      app:data.app,
      type:data.type,
      name:user.fullname,
      displayName:user.username,
      img:data.img,
      org:data.org,
      meta:{user:user.id,scopes:[]},
      loc:{type:"Point",coordinates:loc},
      status:profileStats.NEW,
      info:{...data.info}
    });
    try{await player.saveMe();}catch(e){Utils.error(e);throw e;}
    user.profiles.push({name:role,obj:player});
    await user.saveMe();
    await notify({
      type:"PLAYER_REGISTERED",
      method:EMAIL,
      audience:[{user:user.id,info:user.email}],
      data:{playerName:player.name}
    });
    await AppUsage.make(user,"createdPlayerProfile",{loc});
    user.role = role;
    return true;
  };
  static createDegenPlayers = async (req:IRequest) => {
    const creator:string = req.profile.id;
    const newDegenPlayers:Partial<DegenPokerTypes.IDegenPokerPlayer>[] = req.body.data.items;
    const players:DegenPokerTypes.IDegenPokerPlayer[] = [];
    for(let i = 0,l = newDegenPlayers.length;i<l;i++){
      const nt = {creator,...newDegenPlayers[i]};
      const player = new Models.Profile(nt);
      await player.saveMe();
      players.push(player);
    }
    return {players};
  };
  static getDegenPlayerById = async (playerId:string) => {
    const player = await Models.Profile.findById(playerId);
    if(!player) throw new Utils.AppError(422,'Requested player not found');
    await player.populateMe();
    return {player};
  };
  static updateDegenPlayer = async (playerId:string,{notes,...updates}:any) => {
    const player = await Models.Profile.findByIdAndUpdate(playerId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!player) throw new Utils.AppError(422,'Requested player not found');
    await player.populateMe();
    return {player};
  };
  static deleteDegenPlayer = async (playerId:string) => {
    const player = await Models.Profile.findByIdAndDelete(playerId);
    if (!player) throw new Utils.AppError(422,'Requested player not found');
    return {ok:true};
  };
  static updateDegenPlayerStatus = async (
    admin:string,
    playerId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const player = await Models.Profile.findById(playerId);
    if(!player) throw new Utils.AppError(422,'Requested player not found');
    await player.saveMe();
    return {player};
  };
}