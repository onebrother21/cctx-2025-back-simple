import Types from "../types";

export const CheckAdminScopes:(scopes?:string[]) => IHandler = (scopes) => (req,res,next) => {
  const userScopes = [];
  if(!(scopes && scopes.length)) next();
  else if(userScopes.includes("all")) next();
  else if(userScopes.includes("anything")) next();
  else if(userScopes.includes("everything")) next();
  else {
    let hasScopes = true;
    for(let i=0,j=scopes.length;i<j;i++) if(!userScopes.includes(scopes[i])) hasScopes = false;
    if(!hasScopes) res.status(401).json({succes:false,message:"Unauthorized role!"});
    else next();
  }
};
export default CheckAdminScopes;