const crypto = require('crypto')
const ZKP = require('../zkp/main');

function generateSHA512Hash(data) {
    const hash = crypto.createHash('sha512');
    hash.update(data);
    return hash.digest('hex');
}

const mystery = require('../mystery.json');
const key = ZKP.genKeyPair()

module.exports.generateProof = function (username, password) {
    password = generateSHA512Hash(password)

    const now = Date.now()

    const tmpCommitment = crypto.createHash('sha256').update(mystery.key + "-" + password + "-" + now).digest('hex');
    const proof = ZKP.generateMembershipProof(key.getPublic().encode('hex', true), tmpCommitment)

    return {
        "username": username,
        "timestamp": now,
        "proof": proof,
        "pk": key.getPublic().encode('hex', true)
    }
}