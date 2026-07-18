import {
  GlassAppState,
  GlassAppSockets,
  GlassAppAuth,
} from './core/index.js' ;

import { GlassNumbers } from './glass-numbers.js' ;
import { GlassApp } from './glass-app-main.js' ;

document.addEventListener('DOMContentLoaded',async () => {
  window.glassState = new GlassAppState();
  await GlassApp.myConfig();

  window.glassSockets = new GlassAppSockets();
  window.glassAuth = new GlassAppAuth();
  window.glassNumbers = new GlassNumbers();
  await GlassApp.main();
});
