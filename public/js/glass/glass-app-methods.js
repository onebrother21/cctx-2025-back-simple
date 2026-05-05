export const jsonFormatter = {
  stringify: function(cipherParams){
    let ct = "",iv = "",s = "";
    ct = cipherParams.ciphertext.toString(CryptoJS.enc.Base64);
    if(cipherParams.iv) iv = cipherParams.iv.toString();
    if(cipherParams.salt) s = cipherParams.salt.toString();
    return iv+"\\"+ct+"\\"+s;
  },
  parse: function(jsonStr) {
    const [iv,ct,s] = jsonStr.split("\\");
    const cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(ct)});
    if(iv) cipherParams.iv = CryptoJS.enc.Hex.parse(iv);
    if(s) cipherParams.salt = CryptoJS.enc.Hex.parse(s);
    return cipherParams;
  }
};
export const encrypt_ = (value) => {
  const secret = glassState.getAppConfig().ekey;
  const options = {format:jsonFormatter,mode:CryptoJS.mode.CBC};
  const encrypted = CryptoJS.AES.encrypt(value,secret,options).toString();
  return encrypted;
};
export const decrypt_ = (value) => {
  const secret = glassState.getAppConfig().ekey;
  const options = {format:jsonFormatter};
  const decrypted = CryptoJS.AES.decrypt(value,secret,options).toString(CryptoJS.enc.Utf8);
  return decrypted;
}
export const encrypt = (o) => encrypt_(JSON.stringify(o));
export const decrypt = (o) => JSON.parse(decrypt_(o));

export const myFetch = async (o) => {
  const {method,url,data,withAuth} = o || {};
  if(!(method && url)) throw {status:400,message:"Request malformed"};

  const isPostOrPut = ["POST","PUT"].includes(method);
  const authTkn = glassState.get("authTkn");
  const appConfig = glassState.get("appConfig");

  let useEnc = appConfig?appConfig.ekey:false;
  let body = !data?null:JSON.stringify({data:useEnc?encrypt(data):data});
  if(withAuth && !authTkn) throw {status:401,message:"Unauthorized"};

  const res = await fetch(url,{
    method,
    credentials:"include",
    headers: {
      "x-cctx-e2e":useEnc?"1":"0",
      ...authTkn?{"Authorization":`Bearer ${authTkn}`}:{},
      "Content-type": "application/json; charset=UTF-8",
    },
    ...isPostOrPut && body?{body}:{},
  });
  body = await res.json();
  if(res.status > 399) throw body;
  else {
    const csrfTkn = body.tokens.csrf;
    const authTkn = body.tokens.access;
    const refreshTkn = body.tokens.refresh;
    useEnc = Number(res.headers.get("x-cctx-e2e"));
    console.log({csrfTkn,authTkn,refreshTkn,useEnc});

    csrfTkn?glassState.set("csrfTkn",csrfTkn):null;
    authTkn?glassState.set("authTkn",authTkn.token):null;
    authTkn?glassState.set("authExpires",authTkn.expires):null;
    refreshTkn?glassState.set("refreshTkn",refreshTkn.token):null;
    useEnc && body.data && typeof body.data == "string"?body.data = decrypt(body.data):null;
    return body;
  }
};
export const getAppConfig = async (data) => {
  try{
    const body = await myFetch({method:"GET",url:`/glass/config`});
    console.log(body);
    glassState.setAppConfig(body.data);
  }
  catch(e){console.error(e.message,e);}
};
export const postJob = async (data) => {
  try{
    data.id = user.id;
    data.role = `glass-app-user`;
    const body = await myFetch({method:"POST",url:`/glass/jobs`,data,withAuth:true});
    console.log(body);
    //glassState.setUser(body.data);
    //window.location.href = `/glass/jobs`;
  }
  catch(e){console.error(e.message,e);}
};
export const testNotification = async (data) => {
  try{
    data.id = user.id;
    data.role = `glass-app-user`;
    const body = await myFetch({method:"POST",url:`/glass/test`,data,withAuth:true});
    console.log(body);
    //glassState.setUser(body.data);
    //window.location.href = `/glass/jobs`;
  }
  catch(e){console.error(e.message,e);}
};
const msgs = [
  {
    authorImg:"/images/avatar6.png",
    authorUsername:"Angela",
    timeAgo:"2 minutes ago",
    authorName:"John Doe",
    body:"purchased Premium Plan",
  }
]