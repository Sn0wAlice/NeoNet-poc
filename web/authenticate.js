const ZKP = require('../zkp/main');
const Users = require('../users/main');


module.exports = async function (req, res) { 

    // get the authentication header
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        res.status(401).send({
            error: "Missing authorization header"
        });
        return;
    }

    // check the proof
    const proof = authHeader.replace("Zkpo ", "");
    try {
        const jsonproof = JSON.parse(atob(proof));
        
        // check the proof contain: username, timestamp, proof
        if(!jsonproof.username || !jsonproof.timestamp || !jsonproof.proof || !jsonproof.pk) {
            res.status(401).send({
                error: "Invalid authorization header"
            });
            return;
        }

        // get user by username
        const user = Users.getUser(jsonproof.username);
        if(!user) {
            res.status(401).send({
                error: "Invalid username"
            });
            return;
        }

        // check timestamp is not expired (1 minute)
        if(Date.now() - jsonproof.timestamp > 60000) {
            res.status(401).send({
                error: "Expired timestamp"
            });
            return;
        }

        // check the proof
        const valid = ZKP.userAuth(jsonproof, user);
        
        if(!valid) {
            res.status(401).send({
                error: "Invalid proof"
            });
            return;
        }

        return user

    } catch (error) {
        console.log("error", error);
        res.status(401).send({
            error: "Missing authorization header"
        });
        return;
    }


    return {"username":"admin","password":"admin1234","role":"admin"}
}