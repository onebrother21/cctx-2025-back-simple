import myApp from "./src/init-server";
import myWorkers from "./src/init-workers";
module.exports = (async () => await myWorkers())();