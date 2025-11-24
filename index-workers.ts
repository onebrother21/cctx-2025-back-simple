import myWorkers from "./src/workers";

module.exports = (async () => {
  const app = new myWorkers();
  await app.init();
})();