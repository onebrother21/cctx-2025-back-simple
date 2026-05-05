
const sysyAdmnApi = "/av3/cctx/admn/sys/ui";
export const login = (data) => {
  fetch(`${sysyAdmnApi}/login`, {
    method: "POST",
    body:JSON.stringify({data:{...data,role:`cctx/admn/sys/ui-app-admn`}}),
    credentials:"include",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "x-cctx-e2e":"0",
    }
  })
  .then((res) => {
    if(res.redirected){
      document.location.href = `${sysyAdmnApi}/dash`;
      CCTX.save({user:data.emailOrUsername});
    }
  })
  .catch((e) => console.error(e));
};
export const logout = () => {
  fetch(`${sysyAdmnApi}/logout`, {
    method: "GET",
    credentials:"include",
  })
  .then((response) => {
    if(response.redirected){
      document.location.href = `${sysyAdmnApi}/login`;
      CCTX.save({user:null});
    }
  })
  .catch((e) => console.error(e));
};