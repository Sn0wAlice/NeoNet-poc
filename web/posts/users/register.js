const zkp = require("../../../zkp/main");

module.exports = async function (req, res) {

    // get the request body as a json object
    const body = req.body;

    if(!body.username || !body.password) {
        res.status(400).send({
            error: "Missing username or password"
        });
        return;
    }

    // check the registery key with ZPK authentification
    if(!body.proof) {
        res.status(400).send({
            error: "Missing proof"
        });
        return;
    }

    const authenticate = zkp.authenticate(body.proof);

    if(!authenticate) {
        res.status(400).send({
            error: "Invalid proof"
        });
        return;
    }

    res.send({
        success: true
    })
}