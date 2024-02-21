/**
 * This file is a fucking singleton database
 */
const database = []
const logger = require('../utils/logger')

class Peers {
    constructor() {
        if (!Peers.instance) {
            Peers.instance = this;
        }
    
        return Peers.instance;
    }

    listPeers() {
        logger.debug("-- Listing all peears")
        console.log(database),
        logger.debug("-- End of the list")
    }

    async sendData(hostname, data) {
        logger.logs(`Sending data to ${hostname}`)
        try {
            const req = await fetch(hostname+"/amnesia/data", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(data)
            })
        } catch(err) {}
    }
  
    async checkPeersAvailability(hostname) {
        logger.debug(`Check if peers ${hostname} is up`)
        try {
            const req = await fetch(hostname+"/amnesia/hostname/checkUp")
            const res = await req.json()
            if(res.status == "up") {
                logger.debug(`peers ${hostname} is up`)
                // add peers to datbase
                database.push({
                    hostname: hostname
                })
                return true
            }
        } catch(err) {}
        logger.debug(`peers ${hostname} is down`)
        return false
    }
}

module.exports = new Peers()