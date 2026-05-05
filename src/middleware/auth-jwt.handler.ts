import jwt from 'jsonwebtoken';
import Models from '@models';
import Utils from '@utils';
import Types from '@types';

const {User,DeadToken} = Models;
const jwtSecret = process.env.JWT_KEY || "";

export const AuthJWT:() => IHandler = () => async (req,res,next) => {
  try {
    const header = req.headers.authorization;
    const isTokenStr = header && header.includes("Bearer ");
    const parts = isTokenStr?header.split("Bearer "):[];
    const token = parts[1];
    if(!token) throw new Utils.AppError(401,'Unauthorized - no token');
    
    const decoded = jwt.verify(token,jwtSecret) as Types.IAuthToken;
    if(!decoded || decoded.type !== "access") throw new Utils.AppError(401,"Unauthorized - bad token");

    const deadTkn = await DeadToken.findOne({sub:decoded.sub});
    if(!!deadTkn) throw new Utils.AppError(401,"Unauthorized - dead token");

    const user = await User.findById(decoded.userId);
    if(!user) throw new Utils.AppError(401,"Unauthorized - no user");

    user.device = req.device;
    user.role = decoded.role;
    await user.populateMe();

    req.user = user;
    req.profile = user.getProfile();
    req.token = decoded;
    next();
  }
  catch(e){next(e);}
};
export default AuthJWT;