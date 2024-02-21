module.exports = async function (socket, data) {
    socket.emit('neonet', {
        mod: "pong",
    });
}