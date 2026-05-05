import { DegenPlayersService } from './players.service';
import { DegenPlayersQueriesService } from './players-queries.service';

export class DegenPlayersController { 
  // 📌 DegenPlayer Profile CRUD Ops
  static registerPlayer:IHandler = async (req,res,next) => {
    try {
      const ok = await DegenPlayersService.registerPlayer(req);
      res.locals = {
        ...res.locals,
        status:201,
        success:true,
        message:"You have registered a new player profile!",
        data:{ok},
      };
      next();
    } catch (e) { next(e); }
  };
  static getPlayerById:IHandler = async (req,res,next) => {
    try {
      const playerId = req.params.playerId as string;
      const {player} = await DegenPlayersService.getDegenPlayerById(playerId);
      res.locals.success = true;
      res.locals.data = player.json();
      next();
    } catch (e) { next(e); }
  };
  static updatePlayer:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const playerId = req.params.playerId as string;
      const {player} = await DegenPlayersService.updateDegenPlayer(playerId,data);
      res.locals.success = true;
      res.locals.data = player.json();
      next();
    } catch (e) { next(e); }
  };
  static deletePlayer:IHandler = async (req,res,next) => {
    try {
      const playerId = req.params.playerId as string;
      const {ok} = await DegenPlayersService.deleteDegenPlayer(playerId);
      res.locals.success = ok;
      res.locals.data = {removed:playerId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updatePlayerStatus:IHandler = async (req,res,next) => {
    try {
      const playerId = req.params.playerId as string;
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {player} = await DegenPlayersService.updateDegenPlayerStatus(admin,playerId,data);
      res.locals.success = true;
      res.locals.data = player.json();
      next();
    } catch (e) { next(e); }
  };
}