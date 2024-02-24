const zkp = require("./zkp/main")

if(process.argv.includes('--zkp-proof')) {
    // generate a valid proof
    console.log("Generating a valid proof of membership...")
    console.log(`Proof: \n${btoa(JSON.stringify(zkp.generateValidProof()))}`)
}