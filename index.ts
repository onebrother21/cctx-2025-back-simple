import myApp from "./src/app";

module.exports = (async () => {
  const app = new myApp();
  await app.init();
})();