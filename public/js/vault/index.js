import { AppState } from "./state.js";
import { initApp } from './utils.js' ;

document.addEventListener('DOMContentLoaded', () => {
  window.myState = new AppState();
  initApp();
});