const zkp = require("../../../zkp/main");
const Users = require("../../../users/main");

module.exports = async function (req, res) {
  // get the request body as a json object
  const body = req.body;

  if (!body.username || !body.password) {
    res.status(400).send({
      error: "Missing username or password",
    });
    return;
  }

  // check the registery key with ZPK authentification
  if (!body.proof) {
    res.status(400).send({
      error: "Missing proof",
    });
    return;
  }

  const authenticate = zkp.authenticate(body.proof);

  if (!authenticate) {
    res.status(400).send({
      error: "Invalid proof",
    });
    return;
  }

  // check username us alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(body.username)) {
    res.status(400).send({
      error: "Username must be alphanumeric",
    });
    return;
  }

  // check if the username is already taken
  if (Users.getUser(body.username)) {
    res.status(400).send({
      error: "Username already taken",
    });
    return;
  }

  Users.registerUser(body.username, body.password);

  res.send({
    success: true,
    message: `User ${body.username} registered successfully!`,
  });
};
