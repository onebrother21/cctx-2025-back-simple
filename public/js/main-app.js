import { postJob,testNotification } from './main-app-helpers.js' ;

export const mainAppContext = () => {
  var n = 123;
  const settings = {
    one:1,
    two:"two",
    three:true
  };
  const form = document.querySelector('#myForm');
  form.addEventListener('submit',function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    postJob(data);
  });

  const testForm = document.querySelector('#testNotify');
  testForm.addEventListener('submit',function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    testNotification(data);
  });
};