import { postJob,testNotification } from './glass-app-methods.js' ;

export const mainAppContext = async () => {
  const url = window.location.href;
  const authMode = /signup|verify|register|login/.test(url);
  glassState.set("authMode",authMode);
  await glassAuth.autologin();

  switch(true){
    case /hm/.test(url):{
      glassState.print();
      break;
    }
  }
};