const socket = require("../../socket/server");

module.exports = async function (req, res) {
  console.log("new data");

  // get the body of the request
  const data = req.body;
  console.log(data);

  // check if the data contain: to, from, data
  if (!data.to || !data.from || !data.data) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  // try to send the data to the user
  const s = socket.getSocketByUser(data.to.split("@")[0]);
  if (!socket) {
    res.status(400).send({ error: "User not found" });
    return;
  }
  if (data.type == "rsa") {
    s.emit("neonet_rsa", {
      from: data.from,
      data: data.data,
    });
    res.status(201);
    return;
  } else if (data.type == "encrypted") {
    s.emit("neonet_encrypted", {
      from: data.from,
      data: data.data,
    });
    res.status(201);
    return;
  }

  // send the data
  s.emit("neonet_data", data);
  res.status(201);
};
