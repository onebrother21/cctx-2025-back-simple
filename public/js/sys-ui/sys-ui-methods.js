
const sysAdmnApi = "/av3/cctx/admn/sys/ui";
export const postJob = (data) => {
  console.log(data)
  fetch(`${sysAdmnApi}/jobs`, {
    method: "POST",
    body: JSON.stringify({data}),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => response.json())
  .then((json) => console.log(json))
  .catch((e) => console.error(e));
}
export const testNotification = () => {
  fetch(`${sysAdmnApi}/test`, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => response.json())
  .then((json) => console.log(json))
  .catch((e) => console.error(e));
}