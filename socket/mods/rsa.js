const logger = require("../../utils/logger");
const Peers = require("../../peers/main");

const config = require(process.argv.includes("--config")
  ? "../../" + process.argv[process.argv.indexOf("--config") + 1]
  : "../../config.json");

/**
 * Manage & send data to an user
 * @param {*} socket the socket object
 * @param {*} data the data sent by the client
 * @param {*} io the source io object, used to send data to external server
 * @returns null
 */
module.exports = async function (socket, data, io) {
  // check if the data contain: username, data
  if (!data.to || !data.data) {
    socket.emit("neonet", { error: "Invalid data" });
    return;
  }

  // check is this is a local user or a remote user
  if (data.to.includes("@")) {
    // this is a remote user
    await localDataTransfer(socket, data, io);
    return;
  }

  for (const [key, client] of io.sockets.sockets.entries()) {
    if (client.auth.username === data.to) {
      logger.logs(`sending data to ${data.to}`);
      client.emit("neonet_rsa", {
        from: socket.auth.username,
        data: data.data,
      });
      break;
    }
  }
};

// send the data to the remote server
async function localDataTransfer(socket, data, io) {
  // get the remote server
  const remote = data.to.split("@")[1];
  const user = data.to.split("@")[0];

  // check if the remote server is online
  const available = await Peers.checkPeersAvailability("http://" + remote);
  if (available) {
    // send the data to the remote server
    const response = await Peers.sendData("http://" + remote, {
      from: socket.auth.username + "@" + config.name,
      to: data.to,
      data: data.data,
      type: "rsa",
    });
    console.log(response); // debug the response for the moment, delete this later
  }

  return;
}
