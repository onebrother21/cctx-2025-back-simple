import { CCTX_AdminUIUtils } from './sys-ui-utils.js' ;
import { CCTX_AdminUIDash } from './sys-ui-dash.js' ;
import { login,logout } from './sys-ui-auth.js' ;
import { mainAppContext } from './sys-ui-main.js' ;

document.addEventListener('DOMContentLoaded', () => {
  window.CCTX = new CCTX_AdminUIUtils();
  window.CCTXDash = new CCTX_AdminUIDash();
  window.CCTXAuth = {login,logout};
  mainAppContext();
});