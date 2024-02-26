const EncryptRsa = require("encrypt-rsa").default;
const encryptRsa = new EncryptRsa();
var registreRsa = {};
var askedRsa = [];

class RegistreRsa {
  constructor() {
    if (!RegistreRsa.instance) {
      RegistreRsa.instance = this;
    }
    const { privateKey, publicKey } = encryptRsa.createPrivateAndPublicKeys();
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    return RegistreRsa.instance;
  }
  // Get the public key to share with other users
  getPulicKey() {
    return this.publicKey;
  }

  getListUser() {
    return Object.keys(registreRsa);
  }

  hasKey(id) {
    return registreRsa[id] !== undefined;
  }

  // Add or update a public key to the registry bind to the owner name
  addRsa(id, rsa) {
    registreRsa[id] = rsa;
  }

  isAskedRsa(id) {
    return askedRsa.includes(id);
  }
  addAskedRsa(id) {
    askedRsa.push(id);
  }
  removeAskedRsa(id) {
    askedRsa.splice(askedRsa.indexOf(id), 1);
  }

  // UnCypher the date with my own private key
  unCypher(data) {
    try {
      return [
        true,
        encryptRsa.decryptStringWithRsaPrivateKey({
          text: data,
          privateKey: this.privateKey,
        }),
      ];
    } catch (err) {
      return [false, err];
    }
  }

  // Cypher the data with the public key of the user bind to the id
  cypher(id, data) {
    return encryptRsa.encryptStringWithRsaPublicKey({
      text: data,
      publicKey: registreRsa[id],
    });
  }
}

module.exports = new RegistreRsa();
