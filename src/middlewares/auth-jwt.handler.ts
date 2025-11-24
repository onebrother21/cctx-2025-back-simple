import jwt from 'jsonwebtoken';
import Models from '../models';
import Utils from '../utils';
import Types from '../types';

const jwtSecret = process.env.JWT_KEY || "";
const auth:() => IHandler = () => async (req,res,next) => {
  try {
    const header = req.headers.authorization;
    const isTokenStr = header && header.includes("Bearer ");
    const parts = isTokenStr?header.split("Bearer "):[];
    const token = parts[1];
    
    if(!token) throw new Utils.AppError(401,'Unauthorized - no token');
    const decoded = jwt.verify(token,jwtSecret) as Types.IAuthToken;
    if(!decoded || decoded.type !== "access") throw new Utils.AppError(401,"Unauthorized - bad token");
    const deadTkn = await Models.DeadToken.findOne({sub:decoded.sub});
    if(!!deadTkn) throw new Utils.AppError(401,"Unauthorized - dead token");
    const user = await Models.User.findById(decoded.userId);
    if(!user) throw new Utils.AppError(401,"Unauthorized - no user");

    await user.populateMe();
    user.device = req.device;
    req.user = user;
    req.user.role = decoded.role;
    req.profile = decoded.role?user.profiles[decoded.role]:null;
    req.token = decoded;
    next();
  }
  catch(e){next(e);}
};
export default auth;