import myWorkers from "./src/init-workers";

module.exports = (async () => {
  const workers = new myWorkers();
  await workers.init();
})();