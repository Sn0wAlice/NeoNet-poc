/**
 * This file is the base file for a NeoNet node :)
 */

const fs = require('fs');
const logger = require('./utils/logger');
const web = require('./web/main');
const Peers = require('./peers/main')

console.log(fs.readFileSync('./utils/ascii.art', 'utf8'))

const config = require(process.argv.includes('--config') ? process.argv[process.argv.indexOf('--config')+1] : "./config.json")

async function main() {
    await web.loadRoutes('./web/routes');

    // Start the web service
    await web.route();
    await web.start(config.web.port);

    // wait 3 sec
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });

    // check hostname in the config file is up
    if(!await web.checkUp(config.hostname)) {
        logger.error(`The hostname ${config.hostname} configured in the config file is down.`);
        logger.error(`Please check the hostname and try again.`);
        logger.error(`The hostname ${config.hostname} is down. Exiting...`);
        process.exit(1);
    }

    logger.logs(`Your node is up and running!`);

    Peers.listPeers();
    for(const p of config.peers.friends) {
        await Peers.checkPeersAvailability(p);
    }
    Peers.listPeers();
}


main()