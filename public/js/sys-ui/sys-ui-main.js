import { postJob,testNotification } from './sys-ui-methods.js' ;
import { login } from './sys-ui-auth.js' ;

export const mainAppContext = () => {
  const url = document.location.href;
  switch(true){
    case /login/.test(url):{
      const authForm = document.querySelector('#authForm');
      if(authForm) authForm.addEventListener('submit',event => {
        event.preventDefault();
        const formData = new FormData(authForm);
        const data = Object.fromEntries(formData.entries());
        login(data);
      });
      break;
    }
    case /job/.test(url):{
      const form = document.querySelector('#myForm');
      if(form) form.addEventListener('submit',function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        postJob(data);
      });

      const testForm = document.querySelector('#testNotify');
      if(testForm) testForm.addEventListener('submit',function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        testNotification(data);
      });
      break;
    }
    case /dash/.test(url):{
      const mytab = document.getElementsByClassName("tablink")[0];
      if(mytab) mytab.click();
      CCTXDash.showDivs(CCTXDash.slideIndex);
      CCTX.test();
      break;
    }
  }
};