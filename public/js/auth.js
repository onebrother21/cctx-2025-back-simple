document.addEventListener('DOMContentLoaded', () => {
  const dashUrl = "/av3/pi-mia/system-ui/dash";
  const loginUrl = "/av3/pi-mia/system-ui/login";
  const login = (data) => {
    fetch(loginUrl, {
      method: "POST",
      body: JSON.stringify(data),
      credentials:"include",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    .then((response) => {if(response.redirected) document.location.href = dashUrl;})
    .catch((e) => console.error(e));
  };
  const authForm = document.querySelector('#authForm');
  authForm.addEventListener('submit',function(event) {
    event.preventDefault();
    const formData = new FormData(authForm);
    const data = Object.fromEntries(formData.entries());
    login(data);
  });
});