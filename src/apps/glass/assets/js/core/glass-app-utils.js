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
  const secret = gs.getConfig().ekey;
  const options = {format:jsonFormatter,mode:CryptoJS.mode.CBC};
  const encrypted = CryptoJS.AES.encrypt(value,secret,options).toString();
  return encrypted;
};
export const decrypt_ = (value) => {
  const secret = gs.getConfig().ekey;
  const options = {format:jsonFormatter};
  const decrypted = CryptoJS.AES.decrypt(value,secret,options).toString(CryptoJS.enc.Utf8);
  return decrypted;
}
export const encrypt = (o) => encrypt_(JSON.stringify(o));
export const decrypt = (o) => JSON.parse(decrypt_(o));

export const getHttpReq = o => {
  const {method,url,data,withAuth} = o || {};
  if(!(method && url)) throw {status:400,message:"Request malformed"};

  const isPostOrPut = ["POST","PUT"].includes(method);
  const csrfTkn = gs.get("csrf_tkn");
  const authTkn = gs.get("auth_tkn");
  const appConfig = gs.get("app_config");
  const useEnc = appConfig?appConfig.ekey:false;
  const body = !data?null:JSON.stringify({data:useEnc?encrypt(data):data});
  if(withAuth && !authTkn) throw {status:401,message:"Unauthorized"};
  
  return {
    url,
    method,
    credentials:"include",
    headers: {
      "x-cctx-e2e":useEnc?"1":"0",
      ...authTkn?{"x-csrf-token":`${csrfTkn}`}:{},
      ...authTkn?{"Authorization":`Bearer ${authTkn}`}:{},
      "Content-type": "application/json; charset=UTF-8",
    },
    ...isPostOrPut && body?{body}:{},
  }
}
export const httpReq = async o => {
  const req = getHttpReq(o);
  const res = await fetch(req.url,req);
  const body = await res.json();
  if(res.status > 399) throw body;
  else {
    const csrfTkn = body.tokens.csrf;
    const authTkn = body.tokens.access;
    const refreshTkn = body.tokens.refresh;
    const useEnc = Number(res.headers.get("x-cctx-e2e"));
    // console.log({csrfTkn,authTkn,refreshTkn,useEnc});

    csrfTkn?gs.set("csrf_tkn",csrfTkn):null;
    authTkn?gs.set("auth_tkn",authTkn.token):null;
    authTkn?gs.set("auth_expires",authTkn.expires):null;
    authTkn?gs.set("auth_expiresLocal",shortDate(authTkn.expires)):null;
    refreshTkn?gs.set("refresh_tkn",refreshTkn.token):null;
    useEnc && body.data && typeof body.data == "string"?body.data = decrypt(body.data):null;
    return body;
  }
};
export const shortDate = (d,withTime = true) => {
  try {
    const date = new Date(d);
    const MM = String(date.getMonth() + 1);
    const dd = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    const mm = String(date.getMinutes()).padStart(2, '0');
    const aa = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const hh = String(hours);

    const formatted = `${MM}/${dd}` + (withTime?` ${hh}:${mm} ${aa}`:"");
    return formatted;
  }
  catch(e){throw e;}
}