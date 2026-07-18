import {
  GlassAppState,
  GlassAppSockets,
  GlassAppAuth,
  GlassAppUI,
} from './core/index.js' ;

import { GlassNumbers } from './glass-numbers.js' ;
import { GlassApp } from './glass-app-main.js' ;

document.addEventListener('DOMContentLoaded',async () => {
  window.gs = new GlassAppState();
  window.glassSockets = new GlassAppSockets();
  window.glassAuth = new GlassAppAuth();
  window.glassNumbers = new GlassNumbers();
  
  GlassAppUI.init(GlassApp.handler);
  await GlassApp.config();
  await GlassApp.main();
});
