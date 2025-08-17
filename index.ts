import MyServer from "./src";

module.exports = (async () => {
  const app = new MyServer();
  await app.init();
})();