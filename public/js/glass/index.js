import { GlassAppState } from "./glass-app-state.js";
import { GlassAppSockets } from "./glass-app-sockets.js";
import { GlassAppAuth } from './glass-app-auth.js' ;

import { getAppConfig } from "./glass-app-methods.js";
import { mainAppContext } from './glass-app-main.js' ;
import { initAppUI } from './glass-app-ui.js' ;

document.addEventListener('DOMContentLoaded',async () => {
  window.glassState = new GlassAppState();
  await getAppConfig();
  window.glassSockets = new GlassAppSockets();
  window.glassAuth = new GlassAppAuth();
  await mainAppContext();
  initAppUI();
});
