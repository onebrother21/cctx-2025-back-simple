import { httpReq } from './glass-app-utils.js' ;

export class GlassAppAuth {
  signup = async (data) => {
    try{
      const body = await httpReq({method:"POST",url:`/glass/signup`,data});
      gs.setUser(body.data);
      window.location.href = `/glass/verify`;
    }
    catch(e){console.error(e.message,e);}
  };
  verify = async (data) => {
    try {
      const user = gs.getUser();
      if(!user) throw {status:400,message:"no user provided"};  

      data.id = user.id;
      data.role = `glass-app-user`;
      const body = await httpReq({method:"POST",url:`/glass/verify`,data});
      gs.setUser(body.data);
      window.location.href = `/glass/register`;
    }
    catch(e){console.error(e.message,e);}
  };
  register = async (data) => {
    try {
      const user = gs.getUser();
      if(!user) throw {status:400,message:"no user provided"};

      data.id = user.id;
      data.name = {first:data.firstname,last:data.lastname};
      data.dob = new Date(data.dob.replace("/","-") + " 00:00:00");
      data.agree = data.agree == "on";
      data.role = `glass-app-user`;
      delete data["confirm-pin"];
      delete data["firstname"];
      delete data["lastname"];

      const body = await httpReq({method:"POST",url:`/glass/register`,data});
      gs.setUser(body.data);
      await this.createProfile();
    }
    catch(e){console.error(e.message,e);}
  };
  login = async (data) => {
    try {
      data.role = `glass-app-user`;
      const body = await httpReq({method:"POST",url:`/glass/login`,data});
      gs.setUser(body.data);
      window.location.href = `/glass/hm`;
      console.log(body);
    }
    catch(e){console.error(e);}
  };
  logout = async () => {
    try {
      const body =  await httpReq({method:"GET",url:`/glass/logout`});
      gs.set("auth_tkn",null);
      gs.set("auth_expires",null);
      gs.set("auth_expiresLocal",null);
      gs.setUser(null);
      window.location.href = `/glass/login`;
    }
    catch(e){console.error(e);}
  };
  autologin = async () => {
    if(gs.get("auth_mode")) return;
    try {
      const body = await httpReq({method:"GET",url:`/glass/auto`,withAuth:true});
      gs.setUser(body.data);
      const userProfile = gs.getProfile();
      if(userProfile) glassSockets.init(userProfile);
    }
    catch(e){
      gs.set("auth_tkn",null);
      gs.set("auth_expires",null);
      gs.set("auth_expiresLocal",null);
      gs.setUser(null);
      window.location.href = `/glass/login`;
      console.error(e.message,e);
    }
  };
  createProfile = async () => {
    try{
      const user = gs.getUser();
      if(!user) throw {status:400,message:"no user provided"};

      const data = {
        app:"glass",
        type:`app-user`,
        name:user.name.first + " " + user.name.last,
        displayName:user.username,
        org:"ColorCoded",
        loc:[29.880850,-95.062495]
      };
      const body = await httpReq({method:"POST",url:`/glass/user`,data,withAuth:true});
      gs.setProfile(body.data);
      window.location.href = `/glass/hm`;
    }
    catch(e){console.error(e.message,e);}
  };
}