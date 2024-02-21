const logger = require('../../utils/logger');


module.exports = async function (socket, data, io) {
    // check if the data contain: username, data
    if(!data.to || !data.data) {
        socket.emit('neonet', {error: "Invalid data"});
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