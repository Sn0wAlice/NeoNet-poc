// ping to check socket connectivity
module.exports = async function (socket, data) {
    socket.emit('neonet', {
        mod: "pong",
    });
}