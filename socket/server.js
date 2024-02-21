// create a simple socket server

const io = require('socket.io')();
const fs = require('fs');
const logger = require('../utils/logger');

const mods = [];

module.exports = {
    start: function(port) {

        // read the mods
        const files = fs.readdirSync("./socket/mods");
        files.forEach(file => {
            // if folder, call function recursively
            if (!fs.statSync("./socket/mods" + '/' + file).isDirectory()) {
                mods.push({
                    path: file.replace(".js", ""),
                    inst: require('./mods/' + file)
                });
            }
        });

        io.on('connection', function(socket){
            logger.logs(`socket user connected: ${socket.id}`);

            socket.on('neonet', function(data){
                // check this is a json object
                if(typeof data != 'object') {
                    socket.emit('neonet', {error: "Data must be a json object"});
                    return;
                }

                // now play with the data
                const m = mods.find(m => m.path == data.mod);
                if(!m) {
                    socket.emit('neonet', {error: "Mod not found"});
                    return;
                }

                if(!socket.auth && data.mod != "auth") {
                    socket.emit('neonet', {error: "You must authenticate first"});
                    return;
                }

                m.inst(socket, data, io);
            });

            socket.on('disconnect', function(){
                logger.logs(`socket user disconnected: ${socket.id}`);
            });
        });
        io.listen(port);
    }

}