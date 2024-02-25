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
  let found = false;
  for (const [key, client] of io.sockets.sockets.entries()) {
    if (client.auth.username === data.to) {
      logger.logs(`sending data to ${data.to}`);
      client.emit("neonet_data", {
        from: socket.auth.username,
        data: data.data,
      });
      socket.emit("neonet", {
        from: socket.auth.username,
        to: data.to,
        status: "sent",
      });
      found = true;
      break;
    }
  }
  if (!found) {
    socket.emit("neonet", {
      from: socket.auth.username,
      to: data.to,
      status: "error: user not found",
    });
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
    await Peers.sendData("http://" + remote, {
      from: socket.auth.username + "@" + config.name,
      to: data.to,
      data: data.data,
    })
      .then((response) => {
        socket.emit("neonet", {
          from: socket.auth.username,
          to: data.to,
          status: "sent",
        });
        console.log(response); // debug the response for the moment, delete this later
      })
      .catch((err) => {
        socket.emit("neonet", {
          from: socket.auth.username,
          to: data.to,
          status: `error: ${err.data}`,
        });
      });
  }

  return;
}
