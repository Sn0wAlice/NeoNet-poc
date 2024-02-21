const logger = require('../../utils/logger');
const Peers = require('../../peers/main')

const config = require(process.argv.includes('--config') ? "../../"+process.argv[process.argv.indexOf('--config')+1] : "../../config.json")

module.exports = async function (socket, data, io) {
    // check if the data contain: username, data
    if(!data.to || !data.data) {
        socket.emit('neonet', {error: "Invalid data"});
        return;
    }
    
    console.log(config);

    // check is this is a local user or a remote user
    if(data.to.includes("@")) {
        // this is a remote user

        // get the remote server
        const remote = data.to.split("@")[1];
        const user = data.to.split("@")[0];

        // check if the remote server is online
        const available = await Peers.checkPeersAvailability("http://"+remote);
        console.log(available);
        if(available) {
            // send the data to the remote server
            const response = await Peers.sendData("http://"+remote, {
                from: socket.auth.username+"@"+config.name,
                to: data.to,
                data: data.data
            });
            console.log(response);
        }

        return;
    }
    
    for (const [key, client] of io.sockets.sockets.entries()) {
        if (client.auth.username === data.to) {
            logger.logs(`sending data to ${data.to}`);
            client.emit('neonet_data', {
                from: socket.auth.username,
                data: data.data
            });
            break;
        }
    }

}