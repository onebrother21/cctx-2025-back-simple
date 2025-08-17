import MyWorkers from "./src/index-workers";

module.exports = (async () => {
  const app = new MyWorkers();
  await app.init();
})();