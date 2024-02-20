const elliptic = require('elliptic');
const crypto = require('crypto');
const fs = require('fs');
const f = new (require('../utils/functions'))();

// check if the file ./mystery.json exists
if (!fs.existsSync('./mystery.json')) {
    // create the file ./mystery.json
    fs.writeFileSync('./mystery.json', JSON.stringify({
        "key": f.generateUID()
    }));
}

const mystery = require('../mystery.json');
const ec = new elliptic.ec('secp256k1');

class ZKP {

    serverCommitment;

    constructor() {
        if (!ZKP.instance) {
            ZKP.instance = this;
        }
    
        this.serverCommitment = crypto.createHash('sha256').update(mystery.key).digest('hex')
        return ZKP.instance;
    }

    generateValidProof() {
        const kp = ec.genKeyPair();
        return {
            pk: kp.getPublic().encode('hex', true),
            proof: this.generateMembershipProof(kp.getPublic().encode('hex', true), this.serverCommitment)
        }
    }

    authenticate(proof) {
        try {
            const p = JSON.parse(atob(proof));
            if(this.verifyMembershipProof(p.proof, this.serverCommitment, p.pk)) {
                return true;
            }
        } catch (error) {}
        return false
    }

    // User authentication space
    userAuth(proof, userinfo) {
        const tmpCommitment = crypto.createHash('sha256').update(mystery.key+"-"+userinfo.password+"-"+proof.timestamp).digest('hex');
        if(this.verifyMembershipProof(proof.proof, tmpCommitment, proof.pk)) {
            return true;
        }
        return false;
    }

    genKeyPair() {
        return ec.genKeyPair();
    }

    // Function to generate a proof of knowledge of group membership
    generateMembershipProof(publicKey, groupCommitment) {
        const commitment = publicKey
        const randomValue = crypto.randomBytes(32).toString('hex');

        const challenge = crypto.createHash('sha256')
            .update(groupCommitment)
            .update(commitment)
            .update(randomValue)
            .digest('hex');

        const response = ec.keyFromPrivate(randomValue, 'hex').getPrivate().toString(16);

        return { commitment, challenge, response };
    }

    // Function to verify a proof of knowledge of group membership
    verifyMembershipProof(proof, groupCommitment, publicKey) {
        const { commitment, challenge, response } = proof;

        const newChallenge = crypto.createHash('sha256')
            .update(groupCommitment)
            .update(commitment)
            .update(response)
            .digest('hex');

        return newChallenge === challenge && ec.keyFromPublic(publicKey, 'hex').getPublic().encode('hex', true) === commitment;
    }
}

module.exports = new ZKP();