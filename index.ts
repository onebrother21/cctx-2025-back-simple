import myApp from "./src/init-server";

module.exports = (async () => {
  const app = new myApp();
  await app.init();
})();