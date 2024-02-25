/**
 * This file is the base file for a NeoNet node :)
 */

const fs = require("fs");
const logger = require("./utils/logger");
const web = require("./web/main");
const socket = require("./socket/server");
const Peers = require("./peers/main");
const ZKP = require("./zkp/main");
const http = require("http");

console.log(fs.readFileSync("./utils/ascii.art", "utf8"));

const config = require(process.argv.includes("--config")
  ? process.argv[process.argv.indexOf("--config") + 1]
  : "./config.json");

async function main() {
  await web.loadRoutes();

  // Start the web service
  await web.route();

  let app = web.start();
  const server = http.createServer(app);

  for (const p of config.peers.friends) {
    await Peers.checkPeersAvailability(p);
  }

  if (process.argv.includes("--zkp-proof")) {
    // generate a valid proof
    logger.logs("Generating a valid proof of membership...");
    logger.logs(`Proof: ${btoa(JSON.stringify(ZKP.generateValidProof()))}`);
  }

  // start the socket server

  socket.start(server);
  server.listen(config.web.port, async () => {
    logger.logs(`Web server started on port ${config.web.port}`);
    logger.logs(`Socket server started on port ${config.web.port}`);
    // check hostname in the config file is up
    if (!(await web.checkUp(config.hostname))) {
      logger.error(
        `The hostname ${config.hostname} configured in the config file is down.`
      );
      logger.error(`Please check the hostname and try again.`);
      logger.error(`The hostname ${config.hostname} is down. Exiting...`);
      process.exit(1);
    }
    logger.logs(`Your node is up and running!`);
  });
}

main();
