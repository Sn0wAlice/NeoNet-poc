/**
 * This file is a fucking singleton database
 */
const database = []
const logger = require('../utils/logger')
const crypto = require('crypto');

class Users {
    constructor() {
        if (!Users.instance) {
            Users.instance = this;
        }
    
        return Users.instance;
    }

    generateSHA512Hash(data) {
        const hash = crypto.createHash('sha512');
        hash.update(data);
        return hash.digest('hex');
    }


    registerUser(username, password) {
        // hash the password with sha512
        password = this.generateSHA512Hash(password)
        database.push({
            "username": username,
            "password": password
        })
        console.log(database)
    }

    getUser(username) {
        return database.find(e => e.username = username)
    }
}

module.exports = new Users()