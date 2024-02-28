/**
 * This file is a fucking singleton database
 */
const database = [];
const logger = require("../utils/logger");

class Peers {
  /**
   * This is a singleton, new instance will return itself
   */
  constructor() {
    if (!Peers.instance) {
      Peers.instance = this;
    }

    return Peers.instance;
  }

  /**
   * Used to debug only
   * use me to list all the current pears in the database
   */
  listPeers() {
    logger.debug("-- Listing all peears");
    console.log(database), logger.debug("-- End of the list");
  }

  /**
   * Send data to a specific pears using this hostname and the data in JSON format
   * @param {*} hostname the pear hostname
   * @param {*} data the JSON data for the pears
   */
  sendData(hostname, data) {
    logger.logs(`Sending data to ${hostname}`);
    return fetch(hostname + "/amnesia/data", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Check if the peers is available or not
   * @param {*} hostname the peers hostname
   * @returns the status of the peers, true if it's up, false if it's down
   */
  async checkPeersAvailability(hostname) {
    logger.debug(`Check if peers ${hostname} is up`);
    try {
      const req = await fetch(hostname + "/amnesia/hostname/checkUp");
      const res = await req.json();
      if (res.status == "up") {
        logger.debug(`peers ${hostname} is up`);
        // add peers to database
        database.push({
          hostname: hostname,
        });
        return true;
      }
    } catch (err) {}
    logger.debug(`peers ${hostname} is down`);
    return false;
  }
}

module.exports = new Peers();
