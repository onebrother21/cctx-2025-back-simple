export const validateRequired = (form) => {
  const inputs = form.querySelectorAll('.form-input[required]');
  inputs.forEach(input => {
    if (!input.value.trim()) {
      console.warn(`validation error (${input.name} - required)`);
      input.style.borderColor = '#ff6b6b';
      return false;
    } else {
      input.style.borderColor = '';
    }
  });
  return true;
};
export const validateEmail = (form) => {
  const emailInput = form.querySelector('input[type="email"]');
  if(emailInput && emailInput.value){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      console.warn(`validation error (email - invalid)`);
      emailInput.style.borderColor = '#ff6b6b';
      return false;
    }
    emailInput.style.borderColor = '';
  }
  return true;
};
export const validateDob = (form) => {
  const dobInput = form.querySelector('.form-input.dob-input');
  if(dobInput && dobInput.value){
    try {
      const s = dobInput.value.replace("/","-") + " 00:00:00";
      const d = new Date(s);
    }
    catch(e){
      console.warn(`validation error (dob - invalid)`);
      dobInput.style.borderColor = '#ff6b6b';
      return false;
    }
    dobInput.style.borderColor = '';
  }
  return true;
};
export const validateMobile = (form) => {
  const mobileInput = form.querySelector('.form-input.mobile-input');
  if(mobileInput && mobileInput.value){
    const mobileRegex = /((?:\(?[2-9](?:(?=1)1[02-9]|(?:(?=0)0[1-9]|\d{2}))\)?\D{0,3})(?:\(?[2-9](?:(?=1)1[02-9]|\d{2})\)?\D{0,3})\d{4})/;
    if (!mobileRegex.test(mobileInput.value)) {
      console.warn(`validation error (mobile - invalid)`);
      mobileInput.style.borderColor = '#ff6b6b';
      return false;
    }
    mobileInput.style.borderColor = '';
  }
  return true;
};
export const validateVerificationCode = (form) => {
  const verifyInput = form.querySelector('.form-input.verification-code');
  if(verifyInput && verifyInput.value){
    const verifyRegex = /^[A-Z0-9]{6}$/;
    if (!verifyRegex.test(verifyInput.value)) {
      console.warn(`validation error (verification code - invalid)`);
      verifyInput.style.borderColor = '#ff6b6b';
      return false;
    }
    verifyInput.style.borderColor = '';
  }
  return true;
};
export const validatePins = (form) => {
  const pinInputs = form.querySelectorAll('.form-input.pin-input');
  pinInputs.forEach(input => {
    const pinRegex = /^[0-9]{4}$/;
    if(!input.value.trim() || !pinRegex.test(input.value)){
      console.warn(`validation error (${input.name} - invalid)`);
      input.style.borderColor = '#ff6b6b';
      return false;
    }
    input.style.borderColor = '';
  });
  const last = pinInputs[pinInputs.length - 1];
  const secondToLast = pinInputs[pinInputs.length - 2];
  if(last && secondToLast){
    if(last.value !== secondToLast.value){
      console.warn(`validation error (pin & comfirm-pin - invalid)`);
      last.style.borderColor = '#ff6b6b';
      secondToLast.style.borderColor = '#ff6b6b';
      return false;
    }
    else {
      last.style.borderColor = '';
      secondToLast.style.borderColor = '';
    }
  }
  return true;
};