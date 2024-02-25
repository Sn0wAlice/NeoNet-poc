/**
 * This file is a fucking singleton database
 */
const logger = require("../utils/logger");
const crypto = require("crypto");
const fs = require("fs");
const HOMEDIR =
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] +
  "/.neonet";

// create the directory
fs.mkdirSync(HOMEDIR, { recursive: true });

class Users {
  database = [];
  constructor() {
    if (!Users.instance) {
      Users.instance = this;
    }

    try {
      this.database = JSON.parse(fs.readFileSync(HOMEDIR + "/users.json"));
    } catch (error) {}

    return Users.instance;
  }

  generateSHA512Hash(data) {
    const hash = crypto.createHash("sha512");
    hash.update(data);
    return hash.digest("hex");
  }

  registerUser(username, password) {
    // hash the password with sha512
    password = this.generateSHA512Hash(password);
    this.database.push({
      username: username,
      password: password,
    });
    this.saveDB();
  }

  getUser(username) {
    return this.database.find((e) => (e.username = username));
  }

  /**
   * Database utils
   */
  saveDB() {
    fs.writeFileSync(HOMEDIR + "/users.json", JSON.stringify(this.database));
  }
}

module.exports = new Users();
