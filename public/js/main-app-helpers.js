export const postJob = (data) => {
  console.log(data)
  fetch("/av3/pi-mia/system-ui/jobs", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => response.json())
  .then((json) => console.log(json));
}
export const testNotification = () => {
  fetch("/av3/pi-mia/system-ui/test", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => response.json())
  .then((json) => console.log(json));
}
