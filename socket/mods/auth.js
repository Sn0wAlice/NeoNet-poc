const ZKP = require('../../zkp/main');
const Users = require('../../users/main');

/**
 * This socket module is used to authenticate the user
 * @param {*} socket the socket object
 * @param {*} data the data sent by the client
 */
module.exports = async function (socket, data) {
    
    // check if the user is authenticated
    if(socket.auth) {
        socket.emit('neonet', {error: "You are already authenticated"});
        return;
    }

    // get the authentication header
    const proof = data.auth;
    if(!proof) {
        socket.emit('neonet', {
            error: "Missing authorization header"
        });
        return;
    }

    try { // try, wrong proof may produce error...
        const jsonproof = JSON.parse(atob(proof));
        
        // check the proof contain: username, timestamp, proof
        if(!jsonproof.username || !jsonproof.timestamp || !jsonproof.proof || !jsonproof.pk) {
            socket.emit('neonet', {
                error: "Invalid authorization header"
            });
            return;
        }

        // get user by username
        const user = Users.getUser(jsonproof.username);
        if(!user) {
            socket.emit('neonet', {
                error: "Invalid username"
            });
            return;
        }

        // check timestamp is not expired (1 minute)
        if(Date.now() - jsonproof.timestamp > 60000) {
            socket.emit('neonet', {
                error: "Expired timestamp"
            });
            return;
        }

        // check the proof
        const valid = ZKP.userAuth(jsonproof, user);
        
        if(!valid) {
            socket.emit('neonet', {
                error: "Invalid proof"
            });
            return;
        }

        // set the user as authenticated directly in the socket
        socket.auth = {
            username: user.username,
        }
        // tell to the client that his authentication is successful
        socket.emit('neonet', { 
            success: "You are authenticated"
        });
        return;
    } catch (error) {
        console.log(error)
    }
    socket.emit('neonet', {
        error: "Invalid authorization header"
    });
}