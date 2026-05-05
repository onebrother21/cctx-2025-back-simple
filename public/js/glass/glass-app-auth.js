import { myFetch } from './glass-app-methods.js' ;

export class GlassAppAuth {
  signup = async (data) => {
    try{
      const body = await myFetch({method:"POST",url:`/glass/signup`,data});
      glassState.setUser(body.data);
      window.location.href = `/glass/verify`;
    }
    catch(e){console.error(e.message,e);}
  };
  verify = async (data) => {
    try {
      const user = glassState.getUser();
      if(!user) throw {status:400,message:"no user provided"};  

      data.id = user.id;
      data.role = `glass-app-user`;
      const body = await myFetch({method:"POST",url:`/glass/verify`,data});
      glassState.setUser(body.data);
      window.location.href = `/glass/register`;
    }
    catch(e){console.error(e.message,e);}
  };
  register = async (data) => {
    try {
      const user = glassState.getUser();
      if(!user) throw {status:400,message:"no user provided"};

      data.id = user.id;
      data.name = {first:data.firstname,last:data.lastname};
      data.dob = new Date(data.dob.replace("/","-") + " 00:00:00");
      data.agree = data.agree == "on";
      data.role = `glass-app-user`;
      delete data["confirm-pin"];
      delete data["firstname"];
      delete data["lastname"];

      const body = await myFetch({method:"POST",url:`/glass/register`,data});
      glassState.setUser(body.data);
      await this.createProfile();
    }
    catch(e){console.error(e.message,e);}
  };
  login = async (data) => {
    try {
      data.role = `glass-app-user`;
      const body = await myFetch({method:"POST",url:`/glass/login`,data});
      glassState.setUser(body.data);
      window.location.href = `/glass/hm`;
      console.log(body);
    }
    catch(e){console.error(e);}
  };
  logout = async () => {
    try {
      const body =  await myFetch({method:"GET",url:`/glass/logout`});
      glassState.setUser(null);
      window.location.href = `/glass/login`;
    }
    catch(e){console.error(e);}
  };
  autologin = async () => {
    if(glassState.get("authMode")) return;
    try {
      const body = await myFetch({method:"GET",url:`/glass/auto`,withAuth:true});
      glassState.setUser(body.data);
      const userProfile = glassState.getProfile();
      if(userProfile) glassSockets.init(userProfile);
    }
    catch(e){
      glassState.set("authTkn",null);
      glassState.set("authExpires",null);
      glassState.setUser(null);
      console.error(e.message,e);
    }
  };
  createProfile = async () => {
    try{
      const user = glassState.getUser();
      if(!user) throw {status:400,message:"no user provided"};

      const data = {
        app:"glass",
        type:`app-user`,
        name:user.name.first + " " + user.name.last,
        displayName:user.username,
        org:"ColorCoded",
        loc:[29.880850,-95.062495]
      };
      const body = await myFetch({method:"POST",url:`/glass/user`,data,withAuth:true});
      glassState.setProfile(body.data);
      window.location.href = `/glass/hm`;
    }
    catch(e){console.error(e.message,e);}
  };
}